-- CreateEnum
CREATE TYPE "MenuItemCategory" AS ENUM ('Food', 'Drink');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'PREPARING', 'DELAYED', 'SERVED', 'PAID');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PREPARED', 'DELAYED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESSFUL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Card', 'Transfer', 'Cash');

-- CreateTable
CREATE TABLE "restaurants" (
    "RestaurantID" TEXT NOT NULL,
    "RestaurantName" TEXT NOT NULL,
    "RestaurantAddress" TEXT NOT NULL,
    "RestaurantPhone" TEXT NOT NULL,
    "RestaurantOpeningHours" TEXT NOT NULL,
    "RestaurantStatus" TEXT NOT NULL,
    "RestaurantRating" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("RestaurantID")
);

-- CreateTable
CREATE TABLE "customers" (
    "CustomerID" TEXT NOT NULL,
    "CustomerName" TEXT NOT NULL,
    "CustomerPhone" TEXT NOT NULL,
    "CustomerEmail" TEXT NOT NULL,
    "CustomerTableNo" TEXT NOT NULL,
    "RestaurantID" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("CustomerID")
);

-- CreateTable
CREATE TABLE "waiters" (
    "WaiterID" TEXT NOT NULL,
    "WaiterName" TEXT NOT NULL,
    "WaiterPhone" TEXT NOT NULL,
    "WaiterShift" TEXT NOT NULL,
    "RestaurantID" TEXT NOT NULL,

    CONSTRAINT "waiters_pkey" PRIMARY KEY ("WaiterID")
);

-- CreateTable
CREATE TABLE "chefs" (
    "ChefID" TEXT NOT NULL,
    "ChefName" TEXT NOT NULL,
    "ChefSpecialty" TEXT NOT NULL,
    "ChefPhone" TEXT NOT NULL,
    "ChefShift" TEXT NOT NULL,
    "RestaurantID" TEXT NOT NULL,

    CONSTRAINT "chefs_pkey" PRIMARY KEY ("ChefID")
);

-- CreateTable
CREATE TABLE "bartenders" (
    "BartenderID" TEXT NOT NULL,
    "BartenderName" TEXT NOT NULL,
    "BartenderPhone" TEXT NOT NULL,
    "BartenderShift" TEXT NOT NULL,
    "BartenderStatus" TEXT NOT NULL,
    "RestaurantID" TEXT NOT NULL,

    CONSTRAINT "bartenders_pkey" PRIMARY KEY ("BartenderID")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "MenuItemID" TEXT NOT NULL,
    "MenuItemName" TEXT NOT NULL,
    "MenuItemDescription" TEXT NOT NULL,
    "MenuItemCategory" "MenuItemCategory" NOT NULL,
    "MenuItemPrice" INTEGER NOT NULL,
    "MenuItemPrepTime" INTEGER NOT NULL,
    "MenuItemAvailable" BOOLEAN NOT NULL DEFAULT true,
    "RestaurantID" TEXT NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("MenuItemID")
);

-- CreateTable
CREATE TABLE "orders" (
    "OrderID" TEXT NOT NULL,
    "OrderDateTime" TIMESTAMP(3) NOT NULL,
    "OrderStatus" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "OrderAmount" INTEGER NOT NULL,
    "OrderWaitTime" INTEGER NOT NULL,
    "OrderPreparingAt" TIMESTAMP(3),
    "OrderServedAt" TIMESTAMP(3),
    "CustomerID" TEXT NOT NULL,
    "WaiterID" TEXT,
    "ChefID" TEXT,
    "BartenderID" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("OrderID")
);

-- CreateTable
CREATE TABLE "order_items" (
    "OrderItemID" TEXT NOT NULL,
    "OrderItemQuantity" INTEGER NOT NULL,
    "OrderItemSubTotal" INTEGER NOT NULL,
    "OrderItemStatus" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "OrderID" TEXT NOT NULL,
    "MenuItemID" TEXT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("OrderItemID")
);

-- CreateTable
CREATE TABLE "payments" (
    "PaymentID" TEXT NOT NULL,
    "PaymentAmount" INTEGER NOT NULL,
    "PaymentMethod" "PaymentMethod" NOT NULL,
    "PaymentDateTime" TIMESTAMP(3) NOT NULL,
    "PaymentStatus" "PaymentStatus" NOT NULL DEFAULT 'SUCCESSFUL',
    "OrderID" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("PaymentID")
);

-- CreateTable
CREATE TABLE "complaints" (
    "ComplaintID" TEXT NOT NULL,
    "ComplaintDescription" TEXT NOT NULL,
    "ComplaintDateTime" TIMESTAMP(3) NOT NULL,
    "ComplaintStatus" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "OrderID" TEXT NOT NULL,
    "CustomerID" TEXT NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("ComplaintID")
);

-- CreateTable
CREATE TABLE "ratings" (
    "RatingID" TEXT NOT NULL,
    "RatingScore" INTEGER NOT NULL,
    "RatingComment" TEXT,
    "RatingDateTime" TIMESTAMP(3) NOT NULL,
    "OrderID" TEXT NOT NULL,
    "CustomerID" TEXT NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("RatingID")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_OrderID_key" ON "payments"("OrderID");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_OrderID_key" ON "ratings"("OrderID");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_RestaurantID_fkey" FOREIGN KEY ("RestaurantID") REFERENCES "restaurants"("RestaurantID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiters" ADD CONSTRAINT "waiters_RestaurantID_fkey" FOREIGN KEY ("RestaurantID") REFERENCES "restaurants"("RestaurantID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chefs" ADD CONSTRAINT "chefs_RestaurantID_fkey" FOREIGN KEY ("RestaurantID") REFERENCES "restaurants"("RestaurantID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bartenders" ADD CONSTRAINT "bartenders_RestaurantID_fkey" FOREIGN KEY ("RestaurantID") REFERENCES "restaurants"("RestaurantID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_RestaurantID_fkey" FOREIGN KEY ("RestaurantID") REFERENCES "restaurants"("RestaurantID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "customers"("CustomerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_WaiterID_fkey" FOREIGN KEY ("WaiterID") REFERENCES "waiters"("WaiterID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ChefID_fkey" FOREIGN KEY ("ChefID") REFERENCES "chefs"("ChefID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_BartenderID_fkey" FOREIGN KEY ("BartenderID") REFERENCES "bartenders"("BartenderID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "orders"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_MenuItemID_fkey" FOREIGN KEY ("MenuItemID") REFERENCES "menu_items"("MenuItemID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "orders"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "orders"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "customers"("CustomerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "orders"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "customers"("CustomerID") ON DELETE RESTRICT ON UPDATE CASCADE;
