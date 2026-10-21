const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Ցուցադրական տվյալները՝ prisma/seed-data.js
// Ուշադրություն. սկրիպտը ջնջում է բազայի բոլոր ապրանքներն ու բաժինները։
const { tree, products, promo } = require("./seed-data.js");

const day = 24 * 60 * 60 * 1000;

async function main() {
  console.log("Seeding demo database...");

  await prisma.product.deleteMany();
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany();
  await prisma.promoBanner.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: await bcrypt.hash(adminPassword, 10) },
      create: { email: adminEmail, password: await bcrypt.hash(adminPassword, 10) },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD are not set in .env — admin user was not created.");
  }

  const slugToId = {};
  for (const [i, parent] of tree.entries()) {
    const created = await prisma.category.create({
      data: { name: parent.name, slug: parent.slug, image: parent.image, sortOrder: i },
    });
    slugToId[parent.slug] = created.id;
    for (const [j, child] of parent.children.entries()) {
      const sub = await prisma.category.create({
        data: { ...child, sortOrder: j, parentId: created.id },
      });
      slugToId[child.slug] = sub.id;
    }
  }

  const now = Date.now();
  for (const [i, p] of products.entries()) {
    const { category, images, specs, ...rest } = p;
    await prisma.product.create({
      data: {
        ...rest,
        images: JSON.stringify(images),
        specs: specs ? JSON.stringify(specs) : null,
        categoryId: slugToId[category],
        createdAt: new Date(now - i * day),
      },
    });
  }
  console.log(`${products.length} products created.`);

  await prisma.promoBanner.create({
    data: { text: promo, isActive: true },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
