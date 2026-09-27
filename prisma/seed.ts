import { PrismaClient } from "@prisma/client";
import { Role, UserStatus, ItemCondition, TransactionType, ListingStatus } from "../src/types/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CampusConnect Marketplace database with multi-college campuses...");

  // 1. Seed College Domains
  const domains = [
    { domain: "liet.in", collegeName: "Lloyd Institute of Engineering & Technology (LIET)" },
    { domain: "aktu.in", collegeName: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)" },
    { domain: "college.edu", collegeName: "National Institute of Technology" },
    { domain: "lit.ac.in", collegeName: "Laxminarayan Innovation & Tech Campus" },
    { domain: "iitb.ac.in", collegeName: "Indian Institute of Technology Bombay" },
    { domain: "nith.ac.in", collegeName: "National Institute of Technology Hamirpur" },
    { domain: "campus.edu", collegeName: "Metropolitan Engineering College" },
  ];

  const domainMap = new Map<string, string>();
  for (const d of domains) {
    const existing = await prisma.collegeDomain.upsert({
      where: { domain: d.domain },
      update: { collegeName: d.collegeName },
      create: { domain: d.domain, collegeName: d.collegeName, isActive: true },
    });
    domainMap.set(d.domain, existing.id);
  }
  console.log(`✓ Seeded ${domains.length} college domains (including @liet.in and @aktu.in)`);

  // 2. Seed Categories
  const categories = [
    {
      name: "Textbooks & Reference Books",
      slug: "textbooks",
      icon: "BookOpen",
      description: "Engineering, Mathematics, CS algorithms, and semester books",
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      icon: "Laptop",
      description: "Laptops, scientific calculators, Arduino kits, keyboards, and headphones",
    },
    {
      name: "Engineering Equipment & Tools",
      slug: "engineering-tools",
      icon: "Wrench",
      description: "Mini drafters, engineering drawing sets, lab coats, and breadboards",
    },
    {
      name: "Handwritten Notes & Materials",
      slug: "notes-materials",
      icon: "FileText",
      description: "Topper notes, gate preparation guides, and practical lab manuals",
    },
    {
      name: "Hostel & Room Essentials",
      slug: "hostel-essentials",
      icon: "Home",
      description: "Study lamps, kettles, extension cords, mattresses, and organizers",
    },
    {
      name: "Bicycles & Campus Mobility",
      slug: "cycles-mobility",
      icon: "Bike",
      description: "Geared & non-geared cycles, locks, and accessories for campus commutes",
    },
    {
      name: "Sports & Fitness Gear",
      slug: "sports-fitness",
      icon: "Trophy",
      description: "Badminton racquets, cricket gear, dumbbells, and footballs",
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const existing = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: { ...cat, isActive: true },
    });
    categoryMap.set(cat.slug, existing.id);
  }
  console.log(`✓ Seeded ${categories.length} categories`);

  // 3. Seed Users across multiple campuses
  const defaultPasswordHash = await bcrypt.hash("Campus@1234", 10);
  const lietDomainId = domainMap.get("liet.in")!;
  const aktuDomainId = domainMap.get("aktu.in")!;
  const collegeDomainId = domainMap.get("college.edu")!;

  // Admin User
  await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: { collegeDomainId },
    create: {
      email: "admin@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "System Administrator",
          enrollmentNumber: "ADMIN-001",
          branch: "Dean Student Affairs",
          yearOfStudy: 4,
          bio: "Platform Administrator for CampusConnect",
        },
      },
    },
  });

  // Moderator User
  await prisma.user.upsert({
    where: { email: "moderator@college.edu" },
    update: { collegeDomainId },
    create: {
      email: "moderator@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.MODERATOR,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Prof. Rajesh Kumar",
          enrollmentNumber: "FACULTY-402",
          branch: "Computer Science",
          yearOfStudy: 4,
          bio: "Student Council Moderator & Verification Officer",
        },
      },
    },
  });

  // Lloyd Student: Aman Verma (@liet.in)
  const amanLiet = await prisma.user.upsert({
    where: { email: "aman@liet.in" },
    update: { collegeDomainId: lietDomainId },
    create: {
      email: "aman@liet.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: lietDomainId,
      profile: {
        create: {
          fullName: "Aman Verma",
          enrollmentNumber: "LIET23CSE015",
          branch: "Computer Science & Engineering",
          yearOfStudy: 3,
          phone: "+91 98765 11223",
          bio: "3rd year CSE student at Lloyd Institute. Selling semester textbooks & mini drafter.",
        },
      },
    },
  });

  // AKTU Student: Sneha Singh (@aktu.in)
  const snehaAktu = await prisma.user.upsert({
    where: { email: "sneha@aktu.in" },
    update: { collegeDomainId: aktuDomainId },
    create: {
      email: "sneha@aktu.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: aktuDomainId,
      profile: {
        create: {
          fullName: "Sneha Singh",
          enrollmentNumber: "AKTU24IT089",
          branch: "Information Technology",
          yearOfStudy: 2,
          phone: "+91 98111 22334",
          bio: "2nd year IT student under AKTU curriculum. Trading AKTU Quantum series and notes.",
        },
      },
    },
  });

  // NIT Student: Aarav Sharma (@college.edu)
  const aarav = await prisma.user.upsert({
    where: { email: "aarav@college.edu" },
    update: { collegeDomainId },
    create: {
      email: "aarav@college.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId,
      profile: {
        create: {
          fullName: "Aarav Sharma",
          enrollmentNumber: "2023CSE042",
          branch: "Computer Science & Engineering",
          yearOfStudy: 3,
          phone: "+91 98765 43210",
          bio: "3rd year CSE student. Selling previous semester engineering books and accessories.",
        },
      },
    },
  });

  console.log("✓ Seeded Lloyd (@liet.in), AKTU (@aktu.in), and NIT (@college.edu) student accounts");

  // 4. Seed Campus Listings (Strictly associated with each college domain)
  const textbooksCat = categoryMap.get("textbooks")!;
  const electronicsCat = categoryMap.get("electronics")!;
  const engineeringCat = categoryMap.get("engineering-tools")!;
  const notesCat = categoryMap.get("notes-materials")!;
  const cyclesCat = categoryMap.get("cycles-mobility")!;

  // Clear previous sample listings to ensure fresh college domain mapping
  await prisma.listingImage.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.exchangeRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.listing.deleteMany();

  // --- LLOYD INSTITUTE LISTINGS ---
  await prisma.listing.create({
    data: {
      title: "Operating System Concepts (Galvin & Silberschatz - 10th Edition)",
      description: "Standard OS textbook for Lloyd CSE 4th semester. Clean condition with marked important university exam questions. Available for handover at LIET central canteen.",
      price: 550.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      userId: amanLiet.id,
      categoryId: textbooksCat,
      collegeDomainId: lietDomainId,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
        ],
      },
    },
  });

  await prisma.listing.create({
    data: {
      title: "Omega Engineering Mini Drafter with Sheet Tube & Clips",
      description: "Used for 1st year Engineering Graphics lab at Lloyd. Smooth steel rod, 360-degree protractor head. Handover at LIET Mechanical Lab.",
      price: 350.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      userId: amanLiet.id,
      categoryId: engineeringCat,
      collegeDomainId: lietDomainId,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
        ],
      },
    },
  });

  // --- AKTU LISTINGS ---
  await prisma.listing.create({
    data: {
      title: "AKTU Engineering Mathematics-I & II Quantum Series (Latest Edition)",
      description: "Complete set of AKTU Quantum series covering 5 years solved university question papers. Crucial for semester exams. Handover near AKTU campus block.",
      price: 250.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      userId: snehaAktu.id,
      categoryId: notesCat,
      collegeDomainId: aktuDomainId,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
        ],
      },
    },
  });

  await prisma.listing.create({
    data: {
      title: "Casio fx-991EX ClassWiz Scientific Calculator (AKTU Approved)",
      description: "Approved for AKTU B.Tech term exams. 552 functions with natural textbook display. Handover at library gate.",
      price: 700.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      userId: snehaAktu.id,
      categoryId: electronicsCat,
      collegeDomainId: aktuDomainId,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
        ],
      },
    },
  });

  // --- NIT / GENERAL LISTINGS ---
  await prisma.listing.create({
    data: {
      title: "CLRS Introduction to Algorithms (4th Edition)",
      description: "Standard algorithms textbook in like-new condition. Essential for CS 3rd semester.",
      price: 850.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      userId: aarav.id,
      categoryId: textbooksCat,
      collegeDomainId: collegeDomainId,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
        ],
      },
    },
  });

  await prisma.listing.create({
    data: {
      title: "Hero Sprint 26T Geared Bicycle with Heavy Duty Cable Lock",
      description: "Single-hand used 21-speed bicycle. Great for daily campus mobility.",
      price: 3200.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      userId: aarav.id,
      categoryId: cyclesCat,
      collegeDomainId: collegeDomainId,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", displayOrder: 0 },
        ],
      },
    },
  });

  console.log("✓ Seeded isolated campus listings for Lloyd, AKTU, and NIT with collegeDomainId");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
