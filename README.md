**# Banking Service Backend Application**

### **Overview**
        This backend application provides banking services such as account creation, transactions (credit and withdraw), balance checking, and transaction log downloads. It is built using NestJS with TypeScript, leveraging TypeORM for database interactions and PostgreSQL as the database. It uses JWT for authentication, bcrypt for hashing PINs, and NodeMailer for email notifications. 

### **Features**
`**Account Creation:** Users can create bank accounts with automatic PIN generation and hashing.
**Transaction Handling:** Allows crediting and withdrawing money, with balance checks and transaction logging.
**Balance Checking:** Users can check their account balance.
**Transaction Logs:** Users can download their transaction history in CSV or PDF format.
**Authentication:** JWT-based authentication for secure access.
**Email Notifications:** Users receive email notifications for account creation, large transactions, and log downloads.`

### **Tech Stack**
**Backend Framework:** NestJS (TypeScript)
**ORM:** TypeORM
**Database:** PostgreSQL
**Mail Service:** NodeMailer
**Authentication:** JWT (JSON Web Token)
**Encryption:** bcrypt (for PIN hashing)

### **Setup and Installation**
**Prerequisites**
`Node.js (>=14.x)
PostgreSQL
Yarn (or npm)`