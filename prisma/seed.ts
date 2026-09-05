import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.restaurant.upsert({
    where: { RestaurantID: "R001" },
    update: {},
    create: {
      RestaurantID: "R001",
      RestaurantName: "The Yellow Chilli",
      RestaurantAddress: "12 Adeola Odeku Street, Victoria Island, Lagos",
      RestaurantPhone: "+234 803 123 4567",
      RestaurantOpeningHours: "9:00am - 10:00pm daily",
      RestaurantStatus: "OPEN",
      RestaurantRating: 4.5,
    },
  });

  const customers = [
    { CustomerID: "C001", CustomerName: "Ayo Afolabi", CustomerPhone: "+234 801 111 2222", CustomerEmail: "ayo.afolabi@example.com", CustomerTableNo: "T01" },
    { CustomerID: "C002", CustomerName: "Chika Afolabi", CustomerPhone: "+234 802 222 3333", CustomerEmail: "chika.afolabi@example.com", CustomerTableNo: "T09" },
    { CustomerID: "C003", CustomerName: "Chinelo Rabiu", CustomerPhone: "+234 803 333 4444", CustomerEmail: "chinelo.rabiu@example.com", CustomerTableNo: "T02" },
  ];
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { CustomerID: c.CustomerID },
      update: {},
      create: { ...c, RestaurantID: "R001" },
    });
  }

  const waiters = [
    { WaiterID: "W001", WaiterName: "Chinedu Dim", WaiterPhone: "+234 804 444 5555", WaiterShift: "Morning" },
    { WaiterID: "W002", WaiterName: "Adeola Sam", WaiterPhone: "+234 805 555 6666", WaiterShift: "Afternoon" },
    { WaiterID: "W003", WaiterName: "Favor Anita", WaiterPhone: "+234 806 666 7777", WaiterShift: "Evening" },
  ];
  for (const w of waiters) {
    await prisma.waiter.upsert({
      where: { WaiterID: w.WaiterID },
      update: {},
      create: { ...w, RestaurantID: "R001" },
    });
  }

  const chefs = [
    { ChefID: "CH001", ChefName: "Amaka Nwosu", ChefSpecialty: "Rice dishes", ChefPhone: "+234 807 777 8888", ChefShift: "Morning" },
    { ChefID: "CH002", ChefName: "Femi Adebayo", ChefSpecialty: "Soups & swallow", ChefPhone: "+234 808 888 9999", ChefShift: "Afternoon" },
    { ChefID: "CH003", ChefName: "Halima Amodu", ChefSpecialty: "Grills", ChefPhone: "+234 809 999 0000", ChefShift: "Evening" },
  ];
  for (const c of chefs) {
    await prisma.chef.upsert({
      where: { ChefID: c.ChefID },
      update: {},
      create: { ...c, RestaurantID: "R001" },
    });
  }

  const bartenders = [
    { BartenderID: "BT001", BartenderName: "Disu Rabiu", BartenderPhone: "+234 810 000 1111", BartenderShift: "Morning", BartenderStatus: "On duty" },
    { BartenderID: "BT002", BartenderName: "Ade Daniels", BartenderPhone: "+234 811 111 2222", BartenderShift: "Afternoon", BartenderStatus: "On duty" },
    { BartenderID: "BT003", BartenderName: "Sayo Gold", BartenderPhone: "+234 812 222 3333", BartenderShift: "Evening", BartenderStatus: "Off duty" },
  ];
  for (const b of bartenders) {
    await prisma.bartender.upsert({
      where: { BartenderID: b.BartenderID },
      update: {},
      create: { ...b, RestaurantID: "R001" },
    });
  }

  const foodItems = [
    { MenuItemID: "M001", MenuItemName: "Jollof Rice and Chicken", MenuItemDescription: "Smoky party-style jollof rice with grilled chicken.", MenuItemPrice: 7500, MenuItemPrepTime: 25, MenuItemAvailable: true },
    { MenuItemID: "M002", MenuItemName: "Pepper Soup", MenuItemDescription: "Spicy goat meat pepper soup, served hot.", MenuItemPrice: 6000, MenuItemPrepTime: 20, MenuItemAvailable: true },
    { MenuItemID: "M003", MenuItemName: "Egusi Soup and Pounded Yam", MenuItemDescription: "Melon-seed soup with assorted meat, served with pounded yam.", MenuItemPrice: 6500, MenuItemPrepTime: 30, MenuItemAvailable: true },
    { MenuItemID: "M004", MenuItemName: "Suya Platter", MenuItemDescription: "Grilled skewered beef in a spiced peanut suya rub.", MenuItemPrice: 5000, MenuItemPrepTime: 15, MenuItemAvailable: true },
    { MenuItemID: "M005", MenuItemName: "Fried Rice and Turkey", MenuItemDescription: "Vegetable fried rice with a roasted turkey portion.", MenuItemPrice: 7000, MenuItemPrepTime: 25, MenuItemAvailable: true },
    { MenuItemID: "M006", MenuItemName: "Nkwobi", MenuItemDescription: "Spiced cow-foot delicacy in a rich palm-oil sauce.", MenuItemPrice: 5500, MenuItemPrepTime: 20, MenuItemAvailable: false },
    { MenuItemID: "M007", MenuItemName: "Moi Moi", MenuItemDescription: "Steamed bean pudding with egg and fish.", MenuItemPrice: 2500, MenuItemPrepTime: 15, MenuItemAvailable: true },
    { MenuItemID: "M008", MenuItemName: "Asun", MenuItemDescription: "Spicy chopped grilled goat meat, peppered and smoky.", MenuItemPrice: 6000, MenuItemPrepTime: 15, MenuItemAvailable: true },
    { MenuItemID: "M009", MenuItemName: "Efo Riro with Semo", MenuItemDescription: "Rich vegetable soup with assorted meat and semovita.", MenuItemPrice: 6000, MenuItemPrepTime: 25, MenuItemAvailable: true },
    { MenuItemID: "M010", MenuItemName: "Chicken Shawarma", MenuItemDescription: "Grilled chicken shawarma wrap with house sauce.", MenuItemPrice: 3500, MenuItemPrepTime: 10, MenuItemAvailable: true },
  ];

  const drinkItems = [
    { MenuItemID: "M011", MenuItemName: "Chapman", MenuItemDescription: "Nigeria's classic bittersweet mocktail, served chilled.", MenuItemPrice: 3000, MenuItemPrepTime: 10, MenuItemAvailable: true },
    { MenuItemID: "M012", MenuItemName: "Zobo", MenuItemDescription: "Hibiscus and spice cooler, served ice cold.", MenuItemPrice: 1500, MenuItemPrepTime: 5, MenuItemAvailable: true },
    { MenuItemID: "M013", MenuItemName: "Chilled Malt", MenuItemDescription: "A cold bottle of malt drink.", MenuItemPrice: 1200, MenuItemPrepTime: 2, MenuItemAvailable: true },
    { MenuItemID: "M014", MenuItemName: "Fresh Orange Juice", MenuItemDescription: "Freshly squeezed orange juice, no added sugar.", MenuItemPrice: 2000, MenuItemPrepTime: 5, MenuItemAvailable: true },
    { MenuItemID: "M015", MenuItemName: "Fresh Palm Wine", MenuItemDescription: "Locally tapped palm wine, served fresh.", MenuItemPrice: 2500, MenuItemPrepTime: 5, MenuItemAvailable: true },
    { MenuItemID: "M016", MenuItemName: "Tropical Smoothie", MenuItemDescription: "Blended pineapple, mango and watermelon.", MenuItemPrice: 3000, MenuItemPrepTime: 8, MenuItemAvailable: true },
    { MenuItemID: "M017", MenuItemName: "Soft Drink", MenuItemDescription: "Coke, Fanta or Sprite, ice cold.", MenuItemPrice: 1000, MenuItemPrepTime: 2, MenuItemAvailable: true },
  ];

  for (const item of foodItems) {
    await prisma.menuItem.upsert({
      where: { MenuItemID: item.MenuItemID },
      update: {},
      create: { ...item, MenuItemCategory: "Food", RestaurantID: "R001" },
    });
  }
  for (const item of drinkItems) {
    await prisma.menuItem.upsert({
      where: { MenuItemID: item.MenuItemID },
      update: {},
      create: { ...item, MenuItemCategory: "Drink", RestaurantID: "R001" },
    });
  }

  // Sanity check: every seeded price is a whole naira integer, never a float.
  const allItems = [...foodItems, ...drinkItems];
  for (const item of allItems) {
    if (!Number.isInteger(item.MenuItemPrice)) {
      throw new Error(`MenuItemPrice for ${item.MenuItemID} is not an integer`);
    }
  }

  console.log("Seed complete: 1 restaurant, 3 customers, 3 waiters, 3 chefs, 3 bartenders, %d menu items.", allItems.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
