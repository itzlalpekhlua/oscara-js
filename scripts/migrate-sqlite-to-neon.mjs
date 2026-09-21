// One-time migration of the real content from the committed SQLite database
// (backend/prisma/dev.db) into the Neon Postgres database that Prisma now
// points at. The seed script only produces placeholder rows, so the actual
// admin-entered content lives in dev.db and must be copied verbatim.
//
// Run with the Neon connection in the environment (it is in .env):
//   node scripts/migrate-sqlite-to-neon.mjs
import { DatabaseSync } from "node:sqlite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sqlite = new DatabaseSync(resolve(root, "backend/prisma/dev.db"));
const prisma = new PrismaClient();

const BOOLEAN_FIELDS = new Set(["published"]);
const DATE_FIELDS = new Set(["createdAt", "updatedAt"]);

// SQLite stores booleans as 0/1 and DateTimes as epoch-millisecond integers
// (Prisma's SQLite encoding). Convert those back to the JS types Postgres wants.
function convertRow(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      out[key] = null;
    } else if (BOOLEAN_FIELDS.has(key)) {
      out[key] = Boolean(value);
    } else if (DATE_FIELDS.has(key)) {
      out[key] = new Date(typeof value === "number" ? value : String(value));
    } else {
      out[key] = value;
    }
  }
  return out;
}

function read(table) {
  return sqlite.prepare(`SELECT * FROM "${table}"`).all().map(convertRow);
}

async function main() {
  // Delete in child -> parent order so foreign keys never block a delete.
  const deleteOrder = [
    "designImage",
    "design",
    "buildingType",
    "category",
    "designWorkImage",
    "designWork",
    "projectImage",
    "constructionProject",
    "projectGalleryImage",
    "project",
    "service",
    "teamMember",
    "socialPost",
    "testimonial",
    "mediaFeature",
    "enquiry",
    "costEstimatorRates",
    "siteSettings",
    "adminUser",
  ];
  for (const model of deleteOrder) {
    await prisma[model].deleteMany();
  }

  // Insert in parent -> child order. Services self-reference via parentId, so
  // insert them without parents first, then set parentId in a second pass.
  const services = read("Service");
  const servicesNoParent = services.map(({ parentId, ...rest }) => rest);

  const inserts = [
    ["adminUser", read("AdminUser")],
    ["siteSettings", read("SiteSettings")],
    ["costEstimatorRates", read("CostEstimatorRates")],
    ["category", read("Category")],
    ["buildingType", read("BuildingType")],
    ["design", read("Design")],
    ["designImage", read("DesignImage")],
    ["designWork", read("DesignWork")],
    ["designWorkImage", read("DesignWorkImage")],
    ["constructionProject", read("ConstructionProject")],
    ["projectImage", read("ProjectImage")],
    ["project", read("Project")],
    ["projectGalleryImage", read("ProjectGalleryImage")],
    ["service", servicesNoParent],
    ["teamMember", read("TeamMember")],
    ["socialPost", read("SocialPost")],
    ["testimonial", read("Testimonial")],
    ["mediaFeature", read("MediaFeature")],
    ["enquiry", read("Enquiry")],
  ];

  for (const [model, rows] of inserts) {
    if (rows.length === 0) continue;
    await prisma[model].createMany({ data: rows });
    console.log(`${model}: inserted ${rows.length}`);
  }

  // Second pass: restore service parent relationships.
  const withParent = services.filter((s) => s.parentId);
  for (const s of withParent) {
    await prisma.service.update({ where: { id: s.id }, data: { parentId: s.parentId } });
  }
  console.log(`service parents restored: ${withParent.length}`);

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
