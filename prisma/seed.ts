import { PrismaClient } from "@prisma/client";
import { Role, UserStatus, ItemCondition, TransactionType, ListingStatus } from "../src/types/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CampusConnect Marketplace database with Greater Noida cluster and partner colleges...");

  // 1. Seed College Domains (Featuring Greater Noida Hub near Lloyd Institute)
  const domains = [
    // --- Greater Noida Knowledge Park Cluster ---
    { domain: "liet.in", collegeName: "Lloyd Institute of Engineering & Technology (LIET)" },
    { domain: "gniot.net.in", collegeName: "Greater Noida Institute of Technology (GNIOT)" },
    { domain: "glbitm.ac.in", collegeName: "GL Bajaj Institute of Technology & Management (GLBITM)" },
    { domain: "galgotiascollege.edu", collegeName: "Galgotias College of Engineering & Technology (GCET)" },
    { domain: "sharda.ac.in", collegeName: "Sharda University, Greater Noida" },
    { domain: "bennett.edu.in", collegeName: "Bennett University, Greater Noida" },
    // --- State Technical & Partner Institutions ---
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
  console.log(`✓ Seeded ${domains.length} college domains (including Greater Noida colleges: LIET, GNIOT, GL Bajaj, Galgotias, Sharda, Bennett)`);

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
      description: "Laptops, monitors, scientific calculators, Arduino kits, keyboards, and headphones",
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

  // 3. Seed Verified Student Accounts
  const defaultPasswordHash = await bcrypt.hash("Campus@1234", 10);

  const lietDomainId = domainMap.get("liet.in")!;
  const gniotDomainId = domainMap.get("gniot.net.in")!;
  const glbDomainId = domainMap.get("glbitm.ac.in")!;
  const galgotiasDomainId = domainMap.get("galgotiascollege.edu")!;
  const shardaDomainId = domainMap.get("sharda.ac.in")!;
  const bennettDomainId = domainMap.get("bennett.edu.in")!;
  const aktuDomainId = domainMap.get("aktu.in")!;
  const collegeDomainId = domainMap.get("college.edu")!;
  const litDomainId = domainMap.get("lit.ac.in")!;
  const iitbDomainId = domainMap.get("iitb.ac.in")!;
  const nithDomainId = domainMap.get("nith.ac.in")!;
  const campusDomainId = domainMap.get("campus.edu")!;

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

  // 1. Lloyd Student: Aman Verma
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
          bio: "3rd year CSE student at Lloyd Institute (Knowledge Park II). Selling textbooks, laptop & mini drafter.",
        },
      },
    },
  });

  // 2. GNIOT Student: Rahul Chauhan
  const rahulGniot = await prisma.user.upsert({
    where: { email: "rahul@gniot.net.in" },
    update: { collegeDomainId: gniotDomainId },
    create: {
      email: "rahul@gniot.net.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: gniotDomainId,
      profile: {
        create: {
          fullName: "Rahul Chauhan",
          enrollmentNumber: "GNIOT22ME045",
          branch: "Mechanical Engineering",
          yearOfStudy: 4,
          phone: "+91 98188 33441",
          bio: "Final year Mechanical student at GNIOT (Knowledge Park II, Greater Noida). Available for handover at GNIOT Gate 1 or Pari Chowk.",
        },
      },
    },
  });

  // 3. GL Bajaj Student: Karan Sharma
  const karanGlb = await prisma.user.upsert({
    where: { email: "karan@glbitm.ac.in" },
    update: { collegeDomainId: glbDomainId },
    create: {
      email: "karan@glbitm.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: glbDomainId,
      profile: {
        create: {
          fullName: "Karan Sharma",
          enrollmentNumber: "GLB23CS112",
          branch: "Computer Science & Engineering",
          yearOfStudy: 3,
          phone: "+91 98112 55667",
          bio: "3rd year CSE at GL Bajaj (Knowledge Park III, Greater Noida). Competitive programmer. Selling gaming laptop, algorithms books & notes.",
        },
      },
    },
  });

  // 4. Galgotias Student: Ananya Gupta
  const ananyaGalgotias = await prisma.user.upsert({
    where: { email: "ananya@galgotiascollege.edu" },
    update: { collegeDomainId: galgotiasDomainId },
    create: {
      email: "ananya@galgotiascollege.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: galgotiasDomainId,
      profile: {
        create: {
          fullName: "Ananya Gupta",
          enrollmentNumber: "GCET23ECE088",
          branch: "Electronics & Communication",
          yearOfStudy: 3,
          phone: "+91 99100 88776",
          bio: "3rd year ECE student at Galgotias College (Knowledge Park II). Selling MacBook, Arduino kits, and headphones.",
        },
      },
    },
  });

  // 5. Sharda Student: Tanya Malik
  const tanyaSharda = await prisma.user.upsert({
    where: { email: "tanya@sharda.ac.in" },
    update: { collegeDomainId: shardaDomainId },
    create: {
      email: "tanya@sharda.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: shardaDomainId,
      profile: {
        create: {
          fullName: "Tanya Malik",
          enrollmentNumber: "SU24BT034",
          branch: "Biotechnology & Bioinformatics",
          yearOfStudy: 2,
          phone: "+91 98105 44332",
          bio: "2nd year student at Sharda University (Knowledge Park III). Selling 2-in-1 touchscreen laptop, lab kits, and notes.",
        },
      },
    },
  });

  // 6. Bennett Student: Arjun Singhal
  const arjunBennett = await prisma.user.upsert({
    where: { email: "arjun@bennett.edu.in" },
    update: { collegeDomainId: bennettDomainId },
    create: {
      email: "arjun@bennett.edu.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: bennettDomainId,
      profile: {
        create: {
          fullName: "Arjun Singhal",
          enrollmentNumber: "BU22CSEAI091",
          branch: "Computer Science (AI & ML)",
          yearOfStudy: 3,
          phone: "+91 97110 99881",
          bio: "3rd year AI/ML student at Bennett University, Greater Noida. Selling ROG Gaming laptop, ML books, and hybrid bicycle.",
        },
      },
    },
  });

  // 7. AKTU Student: Sneha Singh
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

  // 8. NIT Student: Aarav Sharma
  const aaravNit = await prisma.user.upsert({
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
          bio: "3rd year CSE student. Selling coding gear, engineering books, and cycle.",
        },
      },
    },
  });

  // 9. LIT Student: Rohit Deshmukh
  const rohitLit = await prisma.user.upsert({
    where: { email: "rohit@lit.ac.in" },
    update: { collegeDomainId: litDomainId },
    create: {
      email: "rohit@lit.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: litDomainId,
      profile: {
        create: {
          fullName: "Rohit Deshmukh",
          enrollmentNumber: "LIT22MECH054",
          branch: "Mechanical Engineering",
          yearOfStudy: 4,
          phone: "+91 98222 33445",
          bio: "Final year Mechanical student at Laxminarayan Institute. Selling drafters, monitors, and laptops.",
        },
      },
    },
  });

  // 10. IIT Bombay Student: Priya Iyer
  const priyaIitb = await prisma.user.upsert({
    where: { email: "priya@iitb.ac.in" },
    update: { collegeDomainId: iitbDomainId },
    create: {
      email: "priya@iitb.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: iitbDomainId,
      profile: {
        create: {
          fullName: "Priya Iyer",
          enrollmentNumber: "220050089",
          branch: "Electrical Engineering",
          yearOfStudy: 3,
          phone: "+91 97654 32100",
          bio: "3rd year EE student at IIT Bombay. Selling electronics kits, books, and sports equipment.",
        },
      },
    },
  });

  // 11. NIT Hamirpur Student: Vikram Chauhan
  const vikramNith = await prisma.user.upsert({
    where: { email: "vikram@nith.ac.in" },
    update: { collegeDomainId: nithDomainId },
    create: {
      email: "vikram@nith.ac.in",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: nithDomainId,
      profile: {
        create: {
          fullName: "Vikram Chauhan",
          enrollmentNumber: "21ECE034",
          branch: "Electronics & Communication",
          yearOfStudy: 4,
          phone: "+91 98160 55667",
          bio: "Final year ECE student at NITH. Moving out after campus placement, clearing gaming laptop, cycle & lab kits.",
        },
      },
    },
  });

  // 12. Metropolitan Student: Tanvi Patel
  const tanviCampus = await prisma.user.upsert({
    where: { email: "tanvi@campus.edu" },
    update: { collegeDomainId: campusDomainId },
    create: {
      email: "tanvi@campus.edu",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
      collegeDomainId: campusDomainId,
      profile: {
        create: {
          fullName: "Tanvi Patel",
          enrollmentNumber: "MEC24CS078",
          branch: "Computer Science",
          yearOfStudy: 2,
          phone: "+91 98980 12345",
          bio: "2nd year CS student at Metropolitan College. Selling 1st year books, calculators, and lab coat.",
        },
      },
    },
  });

  console.log("✓ Seeded verified student accounts for 12 colleges including Greater Noida hub");

  // 4. Seed Campus Listings across all categories and colleges
  const textbooksCat = categoryMap.get("textbooks")!;
  const electronicsCat = categoryMap.get("electronics")!;
  const engineeringCat = categoryMap.get("engineering-tools")!;
  const notesCat = categoryMap.get("notes-materials")!;
  const hostelCat = categoryMap.get("hostel-essentials")!;
  const cyclesCat = categoryMap.get("cycles-mobility")!;
  const sportsCat = categoryMap.get("sports-fitness")!;

  // Clear previous sample listings
  await prisma.listingImage.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.exchangeRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.listing.deleteMany();

  const allListings = [
    // ==========================================
    // 1. LLOYD INSTITUTE (LIET - liet.in) - Greater Noida KP-II
    // ==========================================
    {
      title: "Dell Inspiron 15 Core i5 (11th Gen / 16GB RAM / 512GB NVMe SSD)",
      description: "Selling my engineering coding laptop in pristine condition. Intel Core i5-1135G7, 16GB DDR4 RAM, 512GB Fast SSD, Full HD screen. Battery gives 4.5+ hours for lab sessions. Includes original 65W Dell charger and laptop sleeve. Physical testing available at LIET Central Computer Lab or Library foyer.",
      price: 27500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: electronicsCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Operating System Concepts (Galvin & Silberschatz - 10th Edition)",
      description: "Standard OS textbook for Lloyd CSE 4th semester. Clean condition with marked important university exam questions. No torn pages. Available for direct handover at LIET central canteen.",
      price: 550.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: textbooksCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Omega Engineering Mini Drafter with Sheet Tube & Drafting Clips",
      description: "Used for 1st year Engineering Graphics lab at Lloyd. Smooth steel rod, 360-degree protractor head. Includes sturdy waterproof PVC sheet holder tube. Handover at LIET Mechanical Workshop block.",
      price: 350.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: engineeringCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "GATE CSE Handwritten Topper Revision Notes (Made Easy Complete 10 Subjects)",
      description: "Complete spiral-bound handwritten notes covering Data Structures, Algorithms, OS, DBMS, Computer Networks, TOC, Compiler, COA, Digital, and Discrete Maths. Clear handwriting with solved previous year questions.",
      price: 650.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: amanLiet.id,
      categoryId: notesCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Pigeon 1.5L Stainless Steel Electric Kettle (Hostel Safe with Auto-Cutoff)",
      description: "Very lightly used during winter semester in Lloyd boys hostel. Perfect for quick noodles, tea, coffee, and hot water. 1500W rapid heating with dry-boil safety protection.",
      price: 450.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: hostelCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hero Sprint 26T Hybrid Bicycle with Combination Cable Lock",
      description: "Sturdy single-speed bicycle with front suspension and dual mudguards. Ideal for commuting between hostel and LIET college gates. Tires and brakes in solid condition.",
      price: 2800.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: amanLiet.id,
      categoryId: cyclesCat,
      collegeDomainId: lietDomainId,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 2. GNIOT (Greater Noida Institute of Technology - gniot.net.in) - Knowledge Park II
    // ==========================================
    {
      title: "HP 15s (Intel Core i5 12th Gen / 16GB RAM / 512GB NVMe SSD / Win 11)",
      description: "Fast multi-tasking laptop for engineering simulations and coding projects. Intel Core i5-1235U (10 cores, 12 threads), 16GB DDR4 RAM, 512GB PCIe NVMe SSD. Full HD micro-edge display, 5+ hour battery. Comes with original HP smart adapter. Handover at GNIOT Gate 1 or Central Lawn.",
      price: 28000.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rahulGniot.id,
      categoryId: electronicsCat,
      collegeDomainId: gniotDomainId,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Omega Professional Engineering Mini Drafter & Sheet Tube (Used in GNIOT)",
      description: "Standard engineering mini drafter used in GNIOT Mechanical & Civil 1st Year Engineering Drawing Hall. Steel arm, calibrated protractor scale, tight grip clamp. Includes waterproof sheet carrier tube.",
      price: 350.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rahulGniot.id,
      categoryId: engineeringCat,
      collegeDomainId: gniotDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "GNIOT 2nd Year AKTU Solved Quantum Series (Complete 5-Book Semester Pack)",
      description: "Complete AKTU Quantum series set for 3rd & 4th semester engineering subjects. Contains 5 years solved university question papers with model answers. High scoring notes.",
      price: 320.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rahulGniot.id,
      categoryId: notesCat,
      collegeDomainId: gniotDomainId,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Zebronics 24-inch Borderless Full HD Monitor (100Hz / HDMI / IPS Panel)",
      description: "Ultra-slim 24-inch monitor with 100Hz refresh rate and IPS wide viewing angle. Used for hostel gaming and dual-screen coding at GNIOT boys hostel. Includes HDMI cable and power cord.",
      price: 5800.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rahulGniot.id,
      categoryId: electronicsCat,
      collegeDomainId: gniotDomainId,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Milton 1.8L Stainless Steel Electric Kettle for Hostel Rooms",
      description: "Quick boiling 1.8L kettle with cool-touch handle, 360-degree swivel base, and auto shut-off. Perfect for hostel coffee, maggi, and oatmeal. Clean interior.",
      price: 499.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rahulGniot.id,
      categoryId: hostelCat,
      collegeDomainId: gniotDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hero Octane 26T 21-Speed Alloy Bicycle with Heavy Cable Lock",
      description: "All-terrain geared bicycle with lightweight alloy frame, Shimano 21-speed gears, front suspension fork, and double wall alloy rims. Perfect for Knowledge Park commutes.",
      price: 3500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rahulGniot.id,
      categoryId: cyclesCat,
      collegeDomainId: gniotDomainId,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 3. GL BAJAJ (GLBITM - glbitm.ac.in) - Knowledge Park III
    // ==========================================
    {
      title: "Lenovo IdeaPad Gaming 3 (AMD Ryzen 5 5600H / 16GB RAM / 512GB SSD / GTX 1650)",
      description: "High-performance coding and gaming laptop. 6-core Ryzen 5 5600H CPU, 16GB dual-channel RAM, 512GB NVMe SSD, dedicated 4GB NVIDIA GeForce GTX 1650. 120Hz IPS Full HD display, white backlit keyboard. Runs Android Studio, Docker, and ML models smoothly. Handover at GL Bajaj Main Reception or Canteen.",
      price: 31500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: karanGlb.id,
      categoryId: electronicsCat,
      collegeDomainId: glbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Introduction to Algorithms (CLRS 4th Edition - Hardcover)",
      description: "The official algorithms reference book used in GL Bajaj CSE curriculum. In pristine condition with zero ink annotations. Essential for Data Structures semester and placement coding rounds.",
      price: 750.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: karanGlb.id,
      categoryId: textbooksCat,
      collegeDomainId: glbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "GL Bajaj 3rd Year CSE Web Technologies, Cloud & DevOps Handwritten Notes",
      description: "Detailed handwritten lecture notes covering React, Node.js, REST APIs, Docker, Kubernetes, AWS fundamentals, and CI/CD pipelines. Includes university exam important questions.",
      price: 220.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: karanGlb.id,
      categoryId: notesCat,
      collegeDomainId: glbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Casio fx-991CW ClassWiz Scientific Calculator (Approved for GLB Semester Exams)",
      description: "Latest 2024 model with intuitive 4-gradation display, spreadsheet calculation, matrix, calculus, and equation solver. Working on original battery.",
      price: 850.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: karanGlb.id,
      categoryId: electronicsCat,
      collegeDomainId: glbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Philips 1000W Lightweight Dry Iron & Heat-Resistant Mat for Hostel",
      description: "Linished non-stick coated soleplate dry iron. Heats up in 30 seconds with thermal fuse safety protection. Great for formal clothes ironing during college placement drives.",
      price: 420.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: karanGlb.id,
      categoryId: hostelCat,
      collegeDomainId: glbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Firefox Grunge 26T Mountain Bike with Front Suspension & Mudguards",
      description: "Sturdy steel MTB cycle with wide knobby tires, front suspension fork, and comfortable foam seat. Serviced recently. Includes heavy wire lock with 2 keys.",
      price: 3200.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: karanGlb.id,
      categoryId: cyclesCat,
      collegeDomainId: glbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 4. GALGOTIAS COLLEGE (GCET - galgotiascollege.edu) - Knowledge Park II
    // ==========================================
    {
      title: "Apple MacBook Pro 13-inch (Apple M1 Chip / 8GB Unified / 256GB SSD)",
      description: "Space Grey MacBook Pro with Touch Bar and Touch ID. 8-core CPU, 8-core GPU, stunning Retina display with P3 wide color. 89% battery health (lasts 14+ hours of coding/web browsing). Includes original 61W USB-C Apple charger. Available for inspection at Galgotias Central Lawn or Library.",
      price: 51000.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: ananyaGalgotias.id,
      categoryId: electronicsCat,
      collegeDomainId: galgotiasDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Digital Signal Processing by P. Ramesh Babu (4th Edition - Scitech)",
      description: "Core textbook for ECE and Electrical engineering students at Galgotias. Detailed chapters on DFT, FFT, IIR/FIR filter design, and MATLAB programs. Clean copy.",
      price: 440.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: ananyaGalgotias.id,
      categoryId: textbooksCat,
      collegeDomainId: galgotiasDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Arduino Uno R3 Ultimate Project Starter Kit with 35 Sensors, LCD & Breadboard",
      description: "Complete electronics kit used for ECE IoT term project at Galgotias. Contains original ATmega328P Arduino board, 16x2 I2C LCD, Ultrasonic sensor, DHT11, Servo motor, Relay module, jumper wires, and component box.",
      price: 1350.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: ananyaGalgotias.id,
      categoryId: electronicsCat,
      collegeDomainId: galgotiasDomainId,
      imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Galgotias ECE 5th Semester Signals, Systems & Microcontrollers Topper Notes",
      description: "Neatly written handwritten spiral notebook covering 8051 and ARM architecture, memory interfacing, Laplace transform, and Z-transforms with solved university papers.",
      price: 250.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: ananyaGalgotias.id,
      categoryId: notesCat,
      collegeDomainId: galgotiasDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "boAt Rockerz 550 Over-Ear Wireless Bluetooth Headphones (20-hr Playback)",
      description: "Deep bass 50mm dynamic drivers with plush earcups and physical volume controls. Dual connectivity via Bluetooth 5.0 and 3.5mm AUX cable. Very comfortable for long study sessions.",
      price: 1150.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: ananyaGalgotias.id,
      categoryId: electronicsCat,
      collegeDomainId: galgotiasDomainId,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hercules Roadeo 26T Geared Cycle with Helmet and Front LED Torch",
      description: "Sporty 21-speed cycle with double disc brakes, alloy rims, and front suspension. Comes with matching cycling helmet and rechargeable USB headlight for night riding.",
      price: 3100.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: ananyaGalgotias.id,
      categoryId: cyclesCat,
      collegeDomainId: galgotiasDomainId,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 5. SHARDA UNIVERSITY (sharda.ac.in) - Knowledge Park III
    // ==========================================
    {
      title: "Dell Inspiron 14 2-in-1 Touchscreen Laptop (Core i5 11th Gen / 16GB / 512GB SSD)",
      description: "Convertible 360-degree touchscreen laptop with active digital stylus pen for taking handwritten lecture notes directly on screen. Core i5-1135G7, 16GB RAM, 512GB SSD, backlit keyboard. Handover at Sharda Block 1 or Sunken Garden.",
      price: 36000.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanyaSharda.id,
      categoryId: electronicsCat,
      collegeDomainId: shardaDomainId,
      imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Molecular Biology & Genetic Engineering Principles Textbook (Latest Edition)",
      description: "Standard university textbook covering DNA replication, PCR techniques, recombinant technology, and CRISPR mechanisms. Crisp diagrams and end-of-chapter solved questions.",
      price: 580.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: tanyaSharda.id,
      categoryId: textbooksCat,
      collegeDomainId: shardaDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Sharda University Lab Coat & UV Protection Safety Goggles (Size M/L)",
      description: "Clean pure cotton lab coat with embroidered department crest and anti-scratch UV eye protection goggles. Essential for Biotechnology and Chemistry laboratory practicals.",
      price: 320.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanyaSharda.id,
      categoryId: engineeringCat,
      collegeDomainId: shardaDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Bajaj 1500W Waterproof Immersion Water Heating Rod for Hostel",
      description: "Shockproof immersion heater with nickel-plated heating element, safety bucket handle clip, and power indicator. Perfect for winter mornings in Sharda Mandela Hostel.",
      price: 380.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanyaSharda.id,
      categoryId: hostelCat,
      collegeDomainId: shardaDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Cosco Tour Badminton Racquet Set with Feather Shuttlecock Tube",
      description: "Pair of lightweight aluminum-alloy racquets with reinforced T-joint and full zipped carry bag. Includes 6-pack Yonex Mavis nylon shuttles for evening sports.",
      price: 650.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanyaSharda.id,
      categoryId: sportsCat,
      collegeDomainId: shardaDomainId,
      imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 6. BENNETT UNIVERSITY (bennett.edu.in) - TechZone 2, Greater Noida
    // ==========================================
    {
      title: "ASUS ROG Strix G15 (AMD Ryzen 7 4800H / 16GB RAM / 512GB SSD / RTX 3050 4GB)",
      description: "Powerful gaming and deep learning machine. 8-core, 16-thread Ryzen 7 CPU, 16GB RAM, 512GB NVMe SSD, NVIDIA GeForce RTX 3050. 144Hz IPS display, RGB light bar, liquid metal cooling. Trained CNN models and played AAA games without thermal throttling. Handover at Bennett Student Centre.",
      price: 46000.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: arjunBennett.id,
      categoryId: electronicsCat,
      collegeDomainId: bennettDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (O'Reilly 2nd Ed)",
      description: "The ultimate industry standard book for practical ML and Deep Learning. Covers feature engineering, neural networks, computer vision, and NLP with real Python Jupyter notebook examples.",
      price: 920.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: arjunBennett.id,
      categoryId: textbooksCat,
      collegeDomainId: bennettDomainId,
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Deep Learning & Computer Vision Handwritten Notes with PyTorch Implementations",
      description: "Comprehensive handwritten notes on Convolutional Neural Networks, ResNets, Transformers, Attention mechanisms, and GANs. Includes step-by-step mathematical gradient derivations.",
      price: 380.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: arjunBennett.id,
      categoryId: notesCat,
      collegeDomainId: bennettDomainId,
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Logitech MX Master 2S Wireless Bluetooth Ergonomic Mouse",
      description: "High-precision ergonomic mouse with Darkfield laser tracking (works on glass), hyperscroll wheel, thumb wheel, and Flow cross-computer control. 70-day battery on a single charge.",
      price: 3100.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: arjunBennett.id,
      categoryId: electronicsCat,
      collegeDomainId: bennettDomainId,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Trek Marlin 29T Hybrid Bicycle for Greater Noida Campus Commutes",
      description: "Premium aluminum alloy 29-inch frame hybrid cycle. Smooth Shimano transmission, hydraulic disc brakes, and puncture-resistant Bontrager tires. Serviced last month.",
      price: 6500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: arjunBennett.id,
      categoryId: cyclesCat,
      collegeDomainId: bennettDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 7. AKTU (aktu.in)
    // ==========================================
    {
      title: "HP Pavilion 14 (AMD Ryzen 5 5500U / 8GB RAM / 512GB SSD / FHD IPS)",
      description: "Clean student laptop used for college programming projects and online exams. AMD Ryzen 5, 8GB DDR4 RAM, 512GB NVMe SSD, backlit keyboard and fingerprint scanner. Fast boot time under 8 seconds. Comes with HP original charger.",
      price: 24500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: electronicsCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "AKTU Engineering Mathematics-I & II Quantum Series (Latest Edition)",
      description: "Complete set of AKTU Quantum series covering 5 years solved university question papers. Chapter-wise breakdown with high-scoring questions highlighted. Crucial for semester exams.",
      price: 250.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: notesCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Casio fx-991EX ClassWiz Scientific Calculator (AKTU Exam Approved)",
      description: "Official non-programmable scientific calculator permitted inside AKTU B.Tech examination halls. High-resolution Natural Textbook Display with 552 functions including matrix, equation, and vector calculations.",
      price: 750.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: electronicsCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Higher Engineering Mathematics by B.S. Grewal (44th Edition)",
      description: "Comprehensive engineering math standard textbook covering Calculus, Differential Equations, Linear Algebra, and Complex Variables. Book has plastic cover and clean internal pages.",
      price: 480.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: snehaAktu.id,
      categoryId: textbooksCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "2nd Year IT & CSE Handwritten Data Structures & Algorithm Notes",
      description: "Concise handwritten notes with clean C++ and Java code implementations for Stacks, Queues, Linked Lists, Trees, Graphs, Sorting, and Dynamic Programming. Includes viva questions.",
      price: 200.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: notesCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Wipro 12W LED Flexible Study Lamp with 3 Dimming Color Modes",
      description: "Eye-care desk study lamp with warm, neutral, and cool white modes. Flexible gooseneck with USB charging port. Great for night hostel study sessions without disturbing roommates.",
      price: 399.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: snehaAktu.id,
      categoryId: hostelCat,
      collegeDomainId: aktuDomainId,
      imageUrl: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 8. NATIONAL INSTITUTE OF TECHNOLOGY (college.edu)
    // ==========================================
    {
      title: "Lenovo ThinkPad T480 (Core i7 8th Gen / 32GB RAM / 512GB SSD / Linux Ready)",
      description: "Legendary ThinkPad build quality with dual batteries (6+ hours runtime). Intel Core i7, upgraded to 32GB RAM, 512GB Fast SSD, spill-resistant keyboard and dual Thunderbolt ports. Excellent workstation for Docker, Android Studio, and compiler development.",
      price: 28500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: electronicsCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "CLRS Introduction to Algorithms (4th Edition - MIT Press)",
      description: "The gold standard algorithms textbook in like-new condition. Essential for CSE 3rd semester and FAANG technical interview preparation. Hardcover, no ink marks or highlights.",
      price: 850.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: aaravNit.id,
      categoryId: textbooksCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Computer Networks by Andrew S. Tanenbaum & David Wetherall (5th Edition)",
      description: "Comprehensive networking reference book covering OSI stack, TCP/IP, routing protocols, socket programming, and wireless networks. Includes end-of-chapter solved problem printouts.",
      price: 590.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: textbooksCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Keychron K2 Wireless Mechanical Keyboard (Gateron Brown Tactile Switches)",
      description: "75% compact wireless/wired mechanical keyboard with Mac & Windows layout support. RGB backlighting, Bluetooth 5.1 connectable with up to 3 devices simultaneously. Includes keycap puller and USB-C braided cable.",
      price: 4200.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: aaravNit.id,
      categoryId: electronicsCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hero Sprint Pro 21-Speed Geared Mountain Bicycle with Disk Brakes",
      description: "Alloy frame 27.5T cycle with Shimano 21-speed gears, front suspension fork, and front/rear mechanical disc brakes. Serviced last month with new chain and brake pads. Includes heavy numeric lock.",
      price: 3400.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: cyclesCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "GATE & Placement Coding Master Preparation Formula Notes & Cheat Sheets",
      description: "Laminated quick revision cheat sheets for Time Complexity, Dynamic Programming patterns, SQL queries, and Core CS subject formulas. Saved hours during interview season.",
      price: 320.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: aaravNit.id,
      categoryId: notesCat,
      collegeDomainId: collegeDomainId,
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 9. LAXMINARAYAN INNOVATION CAMPUS (lit.ac.in)
    // ==========================================
    {
      title: "Acer Aspire 5 Laptop (Core i5 12th Gen / 16GB RAM / 512GB SSD / NVIDIA MX550)",
      description: "Purchased in 2nd year, used for CAD rendering, MATLAB simulations, and coding. 12th Gen Intel Core i5-1240P, 16GB dual-channel RAM, dedicated NVIDIA GeForce MX550 GPU. Zero dents, pristine keyboard.",
      price: 29500.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: electronicsCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "LG 24-inch Full HD IPS Borderless Monitor (75Hz / HDMI / AMD FreeSync)",
      description: "24-inch anti-glare desktop monitor with 99% sRGB color accuracy. Perfect secondary screen for split-screen coding and engineering diagrams. Includes HDMI cable and power adapter.",
      price: 6200.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: electronicsCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Database System Concepts by Silberschatz, Korth & Sudarshan (7th Edition)",
      description: "Essential reference book for DBMS course. Covers Relational Model, SQL, Normalization, Transaction Processing, and NoSQL databases. Book is covered with clear plastic wrap.",
      price: 520.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: rohitLit.id,
      categoryId: textbooksCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Engineering Drawing Board (A2 Size) with Mini Drafter & Set Squares",
      description: "High quality pine wood drawing board with metal edges, mini drafter with steel ruler blades, 45 & 60 degree set squares, and drafting tape. Everything required for 1st year Engineering Graphics.",
      price: 550.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: engineeringCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mechanical Engineering Thermodynamics & Fluid Mechanics Solved Lab Manual",
      description: "Handwritten lab observations, circuit/apparatus diagrams, calculation tables, and 100+ viva questions solved for semester university practicals.",
      price: 180.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: rohitLit.id,
      categoryId: notesCat,
      collegeDomainId: litDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 10. IIT BOMBAY (iitb.ac.in)
    // ==========================================
    {
      title: "Apple MacBook Air M1 (8GB Unified Memory / 256GB SSD / Space Grey)",
      description: "Extremely well-maintained MacBook Air with Apple M1 chip. Battery health at 91% (gives full 12+ hours coding session). Retina display with True Tone. Includes original 30W USB-C brick, MagSafe/USB-C braided cable and box.",
      price: 47000.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: electronicsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Introduction to the Theory of Computation by Michael Sipser (3rd Edition)",
      description: "International edition textbook for Automata Theory, Formal Languages, Turing Machines, and Computational Complexity (P vs NP). Crisp condition, no highlighting.",
      price: 600.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: priyaIitb.id,
      categoryId: textbooksCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Raspberry Pi 4 Model B (4GB RAM) with Aluminum Passive Cooling Case & 64GB MicroSD",
      description: "Used for IoT robotics term project at IIT Bombay. Quad-core ARM Cortex-A72 CPU, dual micro-HDMI 4K outputs, Gigabit Ethernet, Bluetooth 5.0. Preloaded with Raspberry Pi OS on SanDisk Extreme 64GB card.",
      price: 4800.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: electronicsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones (50-hr Battery)",
      description: "Lightweight wireless headphones with DSEE audio upscaling, multipoint connection (switches between laptop and phone seamlessly), and built-in microphone for online team meetings.",
      price: 2100.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: electronicsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Competitive Programming & Distributed Systems Handwritten Master Notes",
      description: "Curated collection of 150+ LeetCode Hard and Codeforces Master level algorithms with proofs, trade-offs, and micro-optimizations. Prepared during ICPC practice sessions.",
      price: 450.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: notesCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Yonex Muscle Power 29 Lite Badminton Racquet with Full Cover",
      description: "High tension graphite frame (28 lbs strung with BG65 string), isometric head shape for enlarged sweet spot. Excellent balance for intermediate hostel and Gymkhana players.",
      price: 1100.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: priyaIitb.id,
      categoryId: sportsCat,
      collegeDomainId: iitbDomainId,
      imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 11. NIT HAMIRPUR (nith.ac.in)
    // ==========================================
    {
      title: "ASUS TUF Gaming F15 (Intel Core i5 11th Gen / 16GB RAM / 512GB SSD / GTX 1650)",
      description: "Selling my gaming and simulation laptop before graduation. 144Hz Full HD IPS display, dual fans with anti-dust tunnels, RGB backlit keyboard. Smoothly runs MATLAB, AutoCAD, and games like GTA V and Valorant.",
      price: 33500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: electronicsCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Modern Digital Electronics by R.P. Jain (4th Edition - McGraw Hill)",
      description: "Standard text for Digital Electronics and Logic Design across Indian universities. Explains Boolean Algebra, Combinational circuits, Flip-flops, Counters, and VHDL with worked examples.",
      price: 420.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: vikramNith.id,
      categoryId: textbooksCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Firefox Target 29T Alloy Mountain Bicycle with Front Zoom Shox",
      description: "29-inch lightweight alloy frame mountain cycle designed for hilly campus terrain. Equipped with 21-speed Shimano Tourney gears and front/rear mechanical disc brakes. Smooth climbing.",
      price: 5200.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: cyclesCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "4th Semester ECE & CSE Microprocessors & Embedded Systems Notes",
      description: "Detailed architecture diagrams and assembly programming routines for 8085, 8086, and ARM Cortex processors. Clean handwritten notes with past 7 years solved university questions.",
      price: 220.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: notesCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Havells 1500W Waterproof Immersion Water Heater with Shockproof Handle",
      description: "Essential hostel item for cold Hamirpur winters. Heavy nickel-plated heating element with bucket clip and heat indicator light. Tested and completely safe.",
      price: 350.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: vikramNith.id,
      categoryId: hostelCat,
      collegeDomainId: nithDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    },

    // ==========================================
    // 12. METROPOLITAN ENGINEERING COLLEGE (campus.edu)
    // ==========================================
    {
      title: "Dell Latitude 7490 Business Ultrabook (Core i7 8th Gen / 16GB RAM / 256GB SSD)",
      description: "Durable magnesium-alloy business laptop. Intel Core i7-8650U, 16GB DDR4 RAM, 256GB M.2 SSD, 14-inch Full HD matte display. Battery lasts 5+ hours. Includes Dell charger.",
      price: 21500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: electronicsCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Software Engineering: A Practitioner's Approach by Roger Pressman (8th Edition)",
      description: "Definitive textbook on agile methodologies, software requirements, architecture patterns, testing, and project management. Highlighted definitions for semester exams.",
      price: 500.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: false,
      userId: tanviCampus.id,
      categoryId: textbooksCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Casio fx-82MS 2nd Edition Scientific Calculator",
      description: "Standard 240-function 2-line display scientific calculator. Used for 1st year engineering mathematics and physics practicals. Clean and working on fresh battery.",
      price: 350.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.BOTH,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: electronicsCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Standard Pure Cotton Laboratory Coat (Unisex, Size M/L, Clean)",
      description: "100% white cotton lab coat with 3 pockets and college approved buttons. Essential for Chemistry and Physics lab sessions. Freshly washed and ironed.",
      price: 240.0,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: engineeringCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "1st Year Engineering All-Subjects Solved Notes & Assignment Bundle",
      description: "Comprehensive spiral-bound notes for Basic Electrical, C Programming, Engineering Physics, and Environmental Science. Includes past semester questions with diagrams.",
      price: 290.0,
      condition: ItemCondition.LIKE_NEW,
      transactionType: TransactionType.SELL,
      status: ListingStatus.AVAILABLE,
      campusOnly: true,
      userId: tanviCampus.id,
      categoryId: notesCat,
      collegeDomainId: campusDomainId,
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const item of allListings) {
    await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        price: item.price,
        condition: item.condition,
        transactionType: item.transactionType,
        status: item.status,
        campusOnly: item.campusOnly,
        userId: item.userId,
        categoryId: item.categoryId,
        collegeDomainId: item.collegeDomainId,
        images: {
          create: [{ url: item.imageUrl, displayOrder: 0 }],
        },
      },
    });
  }

  console.log(`✓ Seeded ${allListings.length} rich demo products across all ${domains.length} college campuses!`);

  // 5. Seed Lost & Found Items
  const existingLf = await prisma.lostAndFoundItem.count();
  if (existingLf === 0) {
    await prisma.lostAndFoundItem.create({
      data: {
        type: "FOUND",
        title: "Casio fx-991EX Scientific Calculator",
        description: "Found on the 2nd row bench after CSE Data Structures lab practical. Has a blue carbon vinyl wrap on the slide cover.",
        category: "CALCULATOR",
        location: "Computer Lab 3, 2nd Floor, Academic Block A",
        custodyLocation: "With Student Finder (Meet at LIET Student Canteen)",
        secretQuestion: "What is written in black marker on the battery compartment lid?",
        imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
        status: "OPEN",
        userId: amanLiet.id,
        collegeDomainId: lietDomainId,
      },
    });

    await prisma.lostAndFoundItem.create({
      data: {
        type: "FOUND",
        title: "College ID Card & Delhi Metro Smart Card",
        description: "Found near table 14 in the 1st floor reading hall. Name and student ID are clearly printed.",
        category: "ID_CARD",
        location: "Central Library, 1st Floor Reading Hall",
        custodyLocation: "Deposited at Library Reception Helpdesk",
        secretQuestion: "Confirm your full name, father's name, and 10-digit roll number.",
        imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
        status: "OPEN",
        userId: rahulGniot.id,
        collegeDomainId: gniotDomainId,
      },
    });

    await prisma.lostAndFoundItem.create({
      data: {
        type: "LOST",
        title: "Matte Black HP 65W USB-C Laptop Charger",
        description: "Left behind in the Seminar Hall after the afternoon cloud computing workshop. Charger has a small scratch near the two-pin plug.",
        category: "ELECTRONICS",
        location: "Main Auditorium / Seminar Hall",
        custodyLocation: "Lost by student",
        secretQuestion: "Serial number last 4 digits or brand model code",
        imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
        status: "OPEN",
        userId: amanLiet.id,
        collegeDomainId: lietDomainId,
      },
    });
    console.log("✓ Seeded demo Lost & Found items");
  }

  // 6. Seed Free Giveaways (₹0) and Skill Barter Listings
  const freeGiveawaysExist = await prisma.listing.count({
    where: { transactionType: "DONATION" },
  });
  if (freeGiveawaysExist === 0) {
    const toolsCat = categoryMap.get("engineering-tools")!;
    const notesCat = categoryMap.get("notes-materials")!;

    await prisma.listing.create({
      data: {
        title: "🎁 Free Senior Giveaway: Omega Mini Drafter & Board Clips",
        description: "Graduating senior giveaway! Complete working mini drafter with clamp and 4 board clips. Passing down free to 1st/2nd year juniors to save textbook and stationery expenses.",
        price: 0,
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.DONATION,
        status: ListingStatus.AVAILABLE,
        campusOnly: true,
        userId: amanLiet.id,
        categoryId: toolsCat,
        collegeDomainId: lietDomainId,
        images: {
          create: [{ url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80", displayOrder: 0 }],
        },
      },
    });

    await prisma.listing.create({
      data: {
        title: "🎁 Free Senior Donation: 1st Year Chemistry & Workshop Cotton Apron",
        description: "100% white cotton lab apron (Size M) in clean, washed condition. Free donation for incoming batch students.",
        price: 0,
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.DONATION,
        status: ListingStatus.AVAILABLE,
        campusOnly: true,
        userId: rahulGniot.id,
        categoryId: toolsCat,
        collegeDomainId: gniotDomainId,
        images: {
          create: [{ url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80", displayOrder: 0 }],
        },
      },
    });

    await prisma.listing.create({
      data: {
        title: "💡 Skill Barter: DSA & LeetCode Python Tutoring in Exchange for ED Sheets",
        description: "3rd year CSE student offering 1-on-1 tutoring sessions on Data Structures, Algorithms, and Python coding in exchange for assistance with Engineering Drawing assignments or mechanical workshop practice.",
        price: 0,
        condition: ItemCondition.NEW,
        transactionType: TransactionType.SKILL_EXCHANGE,
        status: ListingStatus.AVAILABLE,
        campusOnly: true,
        userId: amanLiet.id,
        categoryId: notesCat,
        collegeDomainId: lietDomainId,
        images: {
          create: [{ url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", displayOrder: 0 }],
        },
      },
    });

    await prisma.listing.create({
      data: {
        title: "💡 Skill Barter: Web Development (React/Tailwind) Swap for DBMS Exam Notes",
        description: "Offering hands-on guidance to build your college project portfolio website using React & Next.js. In return, looking for comprehensive handwritten notes for Database Management Systems (AKTU syllabus).",
        price: 0,
        condition: ItemCondition.NEW,
        transactionType: TransactionType.SKILL_EXCHANGE,
        status: ListingStatus.AVAILABLE,
        campusOnly: true,
        userId: rahulGniot.id,
        categoryId: notesCat,
        collegeDomainId: gniotDomainId,
        images: {
          create: [{ url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80", displayOrder: 0 }],
        },
      },
    });
    console.log("✓ Seeded demo Free Giveaways (₹0) and Skill Barter listings");
  }

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
