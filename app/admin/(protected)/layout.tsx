import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const newEnquiryCount = await prisma.enquiry.count({ where: { status: "new" } });

  return (
    <div className="flex min-h-screen bg-ink-950 text-bone">
      <AdminSidebar email={user.email} newEnquiryCount={newEnquiryCount} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
