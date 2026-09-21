import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const real = (name: string) => `/uploads/real/${name}`;

async function main() {
  await prisma.designWorkImage.deleteMany();
  await prisma.designWork.deleteMany();
  await prisma.designImage.deleteMany();
  await prisma.design.deleteMany();
  await prisma.buildingType.deleteMany();
  await prisma.category.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.constructionProject.deleteMany();
  await prisma.service.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.mediaFeature.deleteMany();
  await prisma.siteSettings.deleteMany();

  await prisma.siteSettings.create({
    data: {
      id: "singleton",
      tagline: "Premium Homes. Professional Construction.",
      introTitle: "More Than Construction. We Build Your Vision.",
      introBody:
        "At Ojaskaraa Builders, we bring architecture, engineering, construction and interior solutions together under one roof — creating homes that are thoughtfully designed, professionally built and made to last.",
      finalCtaTitle: "Planning to Build Your Dream Home?",
      finalCtaBody:
        "Tell us about your land, requirements and budget. Our team will help you take the first step — serving clients across Nepal.",
      phone: "9801565596",
      phoneSecondary: "9855065373",
      email: "ojaskaraabuilders@gmail.com",
      address: "Bharatpur & Kathmandu, Nepal",
      locationPrimaryName: "Bharatpur, Chitwan",
      locationPrimaryLabel: "Main Office",
      locationSecondaryName: "Teku, Kathmandu",
      locationSecondaryLabel: "Kathmandu Office",
      instagramUrl: "https://www.instagram.com/ojaskaraa_builders/",
      facebookUrl: "https://www.facebook.com/ojaskaraabuilders",
      tiktokUrl: "https://www.tiktok.com/@ojaskaraa_builders",
      whatsappUrl: "https://api.whatsapp.com/send/?phone=9779855065373&text&type=phone_number&app_absent=0",
    },
  });

  // ---------- Our Projects: Category -> Building Type -> Design ----------

  await prisma.category.create({
    data: {
      name: "Residential Buildings",
      slug: "residential-buildings",
      description: "Private homes and residential developments shaped around light, land, and the way people actually live.",
      heroImage: img("photo-1600585154340-be6161a56a0c"),
      order: 0,
      buildingTypes: {
        create: [
          {
            name: "Modern Residential",
            slug: "modern-residential",
            description: "Clean geometry, open volumes, and a contemporary material palette.",
            order: 0,
            designs: {
              create: [
                {
                  name: "Casa Linear",
                  slug: "casa-linear",
                  description: "[FILL: Design description for Casa Linear]",
                  featuredImage: img("photo-1600607687939-ce8a6c25118c"),
                  order: 0,
                  images: {
                    create: [
                      { url: img("photo-1600607687939-ce8a6c25118c"), order: 0 },
                      { url: img("photo-1600596542815-ffad4c1539a9"), order: 1 },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Classical Residential",
            slug: "classical-residential",
            description: "Timeless proportion and traditional detailing, built to endure generations.",
            order: 1,
            designs: {
              create: [
                {
                  name: "The Whitmore Residence",
                  slug: "whitmore-residence",
                  description: "[FILL: Design description for The Whitmore Residence]",
                  featuredImage: img("photo-1592595896616-c37162298647"),
                  order: 0,
                  images: { create: [{ url: img("photo-1592595896616-c37162298647"), order: 0 }] },
                },
              ],
            },
          },
          {
            name: "Duplex",
            slug: "duplex",
            description: "Two-family living with independent entrances and shared street presence.",
            order: 2,
            designs: { create: [] },
          },
          {
            name: "Bungalow",
            slug: "bungalow",
            description: "Single-level living designed for accessibility and effortless flow.",
            order: 3,
            designs: { create: [] },
          },
          {
            name: "Apartment Complex",
            slug: "apartment-complex",
            description: "Multi-storey residential blocks with shared amenities and secure access.",
            order: 4,
            designs: {
              create: [
                {
                  name: "Ojaskaraa Residency",
                  slug: "ojaskaraa-residency",
                  description: "[FILL: Design description for Ojaskaraa Residency]",
                  featuredImage: real("apartment-construction.jpg"),
                  order: 0,
                  images: { create: [{ url: real("apartment-construction.jpg"), order: 0 }] },
                },
              ],
            },
          },
          {
            name: "Housing Colony",
            slug: "housing-colony",
            description: "Planned row-house communities with consistent design language and shared infrastructure.",
            order: 5,
            designs: { create: [] },
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      name: "Commercial Buildings",
      slug: "commercial-buildings",
      description: "Landmark commercial architecture engineered for presence, performance, and permanence.",
      heroImage: real("commercial-frame.jpg"),
      order: 1,
      buildingTypes: {
        create: [
          {
            name: "Office Buildings",
            slug: "office-buildings",
            description: "Corporate headquarters and office towers designed for prestige and productivity.",
            order: 0,
            designs: {
              create: [
                {
                  name: "The Meridian Tower",
                  slug: "meridian-tower",
                  description: "[FILL: Design description for The Meridian Tower]",
                  featuredImage: real("office-glass-tower.jpg"),
                  order: 0,
                  images: {
                    create: [{ url: real("office-glass-tower.jpg"), order: 0 }],
                  },
                },
                {
                  name: "Vantage Corporate Park",
                  slug: "vantage-corporate-park",
                  description: "[FILL: Design description for Vantage Corporate Park]",
                  featuredImage: img("photo-1487958449943-2429e8be8625"),
                  order: 1,
                  images: {
                    create: [
                      { url: img("photo-1487958449943-2429e8be8625"), order: 0 },
                      { url: img("photo-1512917774080-9991f1c4c750"), order: 1 },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Hotels",
            slug: "hotels",
            description: "Hospitality architecture built for arrival, ambience, and unforgettable stays.",
            order: 1,
            designs: {
              create: [
                {
                  name: "Aurelia Grand Hotel",
                  slug: "aurelia-grand-hotel",
                  description: "[FILL: Design description for Aurelia Grand Hotel]",
                  featuredImage: real("hotel-1.jpg"),
                  order: 0,
                  images: {
                    create: [
                      { url: real("hotel-1.jpg"), order: 0 },
                      { url: real("hotel-pool-1.jpg"), order: 1 },
                      { url: real("hotel-pool-2.jpg"), order: 2 },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "School",
            slug: "school",
            description: "Educational campuses designed for light, safety, and focus.",
            order: 2,
            designs: {
              create: [
                {
                  name: "[FILL: School project name]",
                  slug: "school-project",
                  description: "[FILL: Design description for the school project]",
                  featuredImage: real("school-1.jpg"),
                  order: 0,
                  images: {
                    create: [
                      { url: real("school-1.jpg"), order: 0 },
                      { url: real("school-2.jpg"), order: 1 },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Warehouse",
            slug: "warehouse",
            description: "Large-span industrial storage built for logistics and durability.",
            order: 3,
            designs: {
              create: [
                {
                  name: "[FILL: Warehouse project name]",
                  slug: "warehouse-project",
                  description: "[FILL: Design description for the warehouse project]",
                  featuredImage: real("warehouse-exterior.jpg"),
                  order: 0,
                  images: {
                    create: [
                      { url: real("warehouse-exterior.jpg"), order: 0 },
                      { url: real("warehouse-frame-workers.jpg"), order: 1 },
                      { url: real("warehouse-roof-1.jpg"), order: 2 },
                      { url: real("warehouse-roof-2.jpg"), order: 3 },
                      { url: real("warehouse-roof-3.jpg"), order: 4 },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Factory",
            slug: "factory",
            description: "Production facilities engineered around workflow and safety.",
            order: 4,
            designs: { create: [] },
          },
        ],
      },
    },
  });

  // ---------- Our Design: Interior / Exterior x Residential / Commercial ----------

  await prisma.designWork.createMany({
    data: [
      {
        title: "2D Modular House Plan",
        slug: "2d-modular-house-plan",
        kind: "interior",
        scope: "residential",
        roomType: "2D Modular",
        description: "[FILL: Description for 2D modular house plan]",
        featuredImage: img("photo-1503387762-592deb58ef4e"),
        order: 0,
      },
      {
        title: "Modular Kitchen Design",
        slug: "modular-kitchen-design",
        kind: "interior",
        scope: "residential",
        roomType: "Kitchen",
        description: "[FILL: Description for modular kitchen design]",
        featuredImage: img("photo-1600585154340-be6161a56a0c"),
        order: 1,
      },
      {
        title: "Living Room Design",
        slug: "living-room-design",
        kind: "interior",
        scope: "residential",
        roomType: "Living Room",
        description: "[FILL: Description for living room design]",
        featuredImage: img("photo-1449844908441-8829872d2607"),
        order: 2,
      },
      {
        title: "Bedroom Design",
        slug: "bedroom-design",
        kind: "interior",
        scope: "residential",
        roomType: "Bedroom",
        description: "[FILL: Description for bedroom design]",
        featuredImage: img("photo-1592595896616-c37162298647"),
        order: 3,
      },
      {
        title: "Office Interior",
        slug: "office-interior",
        kind: "interior",
        scope: "commercial",
        roomType: null,
        description: "[FILL: Description for office interior]",
        featuredImage: img("photo-1497366216548-37526070297c"),
        order: 0,
      },
      {
        title: "Factory Floor Interior",
        slug: "factory-floor-interior",
        kind: "interior",
        scope: "commercial",
        roomType: null,
        description: "[FILL: Description for factory floor interior]",
        featuredImage: img("photo-1541888946425-d81bb19240f5"),
        order: 1,
      },
      {
        title: "Modern Home Exterior",
        slug: "modern-home-exterior",
        kind: "exterior",
        scope: "residential",
        roomType: null,
        description: "[FILL: Description for modern home exterior]",
        featuredImage: img("photo-1600607687939-ce8a6c25118c"),
        order: 0,
      },
      {
        title: "Classical Home Exterior",
        slug: "classical-home-exterior",
        kind: "exterior",
        scope: "residential",
        roomType: null,
        description: "[FILL: Description for classical home exterior]",
        featuredImage: img("photo-1592595896616-c37162298647"),
        order: 1,
      },
      {
        title: "Office Building Exterior",
        slug: "office-building-exterior",
        kind: "exterior",
        scope: "commercial",
        roomType: null,
        description: "[FILL: Description for office building exterior]",
        featuredImage: img("photo-1486406146926-c627a92ad1ab"),
        order: 0,
      },
      {
        title: "Factory Exterior",
        slug: "factory-exterior",
        kind: "exterior",
        scope: "commercial",
        roomType: null,
        description: "[FILL: Description for factory exterior]",
        featuredImage: img("photo-1512917774080-9991f1c4c750"),
        order: 1,
      },
    ],
  });

  // ---------- Construction Projects ----------

  await prisma.constructionProject.create({
    data: {
      title: "Commercial Site — Structure & Quality Control",
      slug: "commercial-site-structure-quality-control",
      categoryLabel: "Commercial",
      location: "[FILL: Location]",
      description: "[FILL: Project information for this commercial site build]",
      featuredImage: real("commercial-frame.jpg"),
      order: 0,
      images: {
        create: [
          { url: real("commercial-frame.jpg"), order: 0 },
          { url: real("qc-drilling.jpg"), order: 1 },
        ],
      },
    },
  });

  await prisma.constructionProject.create({
    data: {
      title: "Residential Interior — Finishing Stage",
      slug: "residential-interior-finishing-stage",
      categoryLabel: "Residential",
      location: "[FILL: Location]",
      description: "[FILL: Project information for this residential interior finishing]",
      featuredImage: real("interior-finishing.jpg"),
      order: 1,
      images: {
        create: [{ url: real("interior-finishing.jpg"), order: 0 }],
      },
    },
  });

  await prisma.constructionProject.create({
    data: {
      title: "[FILL: School project name] — Site Documentation",
      slug: "school-project-site-documentation",
      categoryLabel: "School",
      location: "[FILL: Location]",
      description: "[FILL: Project information for the school build]",
      featuredImage: real("school-1.jpg"),
      order: 2,
      images: {
        create: [
          { url: real("school-1.jpg"), order: 0 },
          { url: real("school-2.jpg"), order: 1 },
        ],
      },
    },
  });

  await prisma.constructionProject.create({
    data: {
      title: "[FILL: Warehouse project name] — Site Documentation",
      slug: "warehouse-project-site-documentation",
      categoryLabel: "Warehouse",
      location: "[FILL: Location]",
      description: "[FILL: Project information for the warehouse build]",
      featuredImage: real("warehouse-exterior.jpg"),
      order: 3,
      images: {
        create: [
          { url: real("warehouse-exterior.jpg"), order: 0 },
          { url: real("warehouse-frame-workers.jpg"), order: 1 },
          { url: real("warehouse-roof-1.jpg"), order: 2 },
          { url: real("warehouse-roof-2.jpg"), order: 3 },
          { url: real("warehouse-roof-3.jpg"), order: 4 },
        ],
      },
    },
  });

  // ---------- Our Services (refine later — process journey kept as-is) ----------

  await prisma.service.create({
    data: {
      title: "Visualization",
      slug: "visualization",
      description: "Seeing the building before a single foundation is poured.",
      image: img("photo-1503387762-592deb58ef4e"),
      order: 0,
      children: {
        create: [
          {
            title: "2D Visualization",
            slug: "2d-visualization",
            description:
              "The land is measured and mapped to true scale, and the building footprint is fixed in precise two-dimensional drawings before anything else begins.",
            image: img("photo-1503387762-592deb58ef4e", 900),
            order: 0,
          },
          {
            title: "3D Visualization",
            slug: "3d-visualization",
            description:
              "The fixed 2D plan is developed into a full three-dimensional model so the form, massing, and materials can be seen before construction starts.",
            image: real("render-3d.jpg"),
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.service.createMany({
    data: [
      {
        title: "Architecture Design",
        slug: "architecture-design",
        description: "[FILL: Architecture design deliverables]",
        image: img("photo-1512917774080-9991f1c4c750"),
        order: 1,
      },
      {
        title: "Cost Estimation",
        slug: "cost-estimation",
        description: "[FILL: Cost estimation deliverables]",
        image: real("cost-estimation.png"),
        order: 2,
      },
      {
        title: "Agreement",
        slug: "agreement",
        description: "[FILL: Agreement information]",
        image: real("agreement-signing.png"),
        order: 3,
      },
      {
        title: "Construction",
        slug: "construction",
        description: "[FILL: Construction deliverables]",
        image: real("commercial-frame.jpg"),
        order: 4,
      },
      {
        title: "Quality Control & Inspection",
        slug: "quality-control-inspection",
        description: "[FILL: Quality-control/inspection information]",
        image: real("qc-drilling.jpg"),
        order: 5,
      },
      {
        title: "Handover",
        slug: "handover",
        description: "[FILL: Handover information]",
        image: real("key-handover.png"),
        order: 6,
      },
    ],
  });

  await prisma.teamMember.createMany({
    data: [
      {
        name: "[FILL: Chairman name]",
        role: "Chairman",
        description: "[FILL: A short word from the Chairman — a brief message about the company vision and values]",
        order: 0,
      },
      {
        name: "[FILL: Managing Director name]",
        role: "Managing Director",
        description: "[FILL: Short bio for the Managing Director]",
        order: 1,
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      { customerName: "[FILL: Customer name]", reviewText: "[FILL: Customer review]", order: 0 },
      { customerName: "[FILL: Customer name]", reviewText: "[FILL: Customer review]", videoUrl: null, order: 1 },
    ],
  });

  await prisma.socialPost.createMany({
    data: [
      { platform: "INSTAGRAM", embedUrl: "https://www.instagram.com/ojaskaraa_builders/", thumbnail: img("photo-1503387762-592deb58ef4e"), caption: null, order: 0 },
      { platform: "TIKTOK", embedUrl: "https://www.tiktok.com/@ojaskaraa_builders", thumbnail: img("photo-1541888946425-d81bb19240f5"), caption: null, order: 1 },
      { platform: "FACEBOOK", embedUrl: "https://www.facebook.com/ojaskaraabuilders", thumbnail: img("photo-1600585154340-be6161a56a0c"), caption: null, order: 2 },
    ],
  });

  await prisma.mediaFeature.createMany({
    data: [
      { title: "[FILL: Newspaper article headline]", outlet: "[FILL: Newspaper name]", type: "article", url: "#", order: 0 },
      { title: "[FILL: Podcast episode title]", outlet: "[FILL: Podcast/channel name]", type: "podcast", url: "#", order: 1 },
      { title: "[FILL: Interview title]", outlet: "[FILL: TV/YouTube channel name]", type: "interview", url: "#", order: 2 },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
