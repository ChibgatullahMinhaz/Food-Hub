# FoodHub 🍱
**"Discover & Order Delicious Meals"**

---

## Project Overview

FoodHub is a full-stack web application for meal ordering. Customers can browse menus from various food providers, place orders, and track delivery status. Providers can manage their menus and fulfill orders. Admins oversee the platform and manage all users.

---

## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Customer** | Users who order meals | Browse menus, place orders, track status, leave reviews |
| **Provider** | Food vendors/restaurants | Manage menu, view orders, update order status |
| **Admin** | Platform moderators | Manage all users, oversee orders, moderate content |

> 💡 **Note**: Users select their role during registration. Admin accounts should be seeded in the database.

---

## Tech Stack

🛠️ **See [README.md](./README.md#-tech-stack) for complete technology specifications.**

---

## Features

### Public Features
- Browse all available meals and providers
- Filter meals by cuisine, dietary preferences, and price
- View provider profiles with menus

### Customer Features
- Register and login as customer
- Add meals to cart
- Place orders with delivery address (Cash on Delivery)
- Track order status
- Leave reviews after ordering
- Manage profile

### Provider Features
- Register and login as provider
- Add, edit, and remove menu items
- View incoming orders
- Update order status

### Admin Features
- View all users (customers and providers)
- Manage user status (suspend/activate)
- View all orders
- Manage categories

---

## Pages & Routes

> ⚠️ **Note**: These routes are examples. You may add, edit, or remove routes based on your implementation needs.

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, categories, featured |
| `/meals` | Browse Meals | List with filters |
| `/meals/:id` | Meal Details | Info, add to cart |
| `/providers/:id` | Provider | Menu, info |
| `/login` | Login | Login form |
| `/register` | Register | Registration form |

### Customer Routes (Private)
| Route | Page | Description |
|-------|------|-------------|
| `/cart` | Cart | View cart items |
| `/checkout` | Checkout | Delivery address |
| `/orders` | My Orders | Order history |
| `/orders/:id` | Order Details | Items, status |
| `/profile` | Profile | Edit info |

### Provider Routes (Private)
| Route | Page | Description |
|-------|------|-------------|
| `/provider/dashboard` | Dashboard | Orders, stats |
| `/provider/menu` | Menu | Manage meals |
| `/provider/orders` | Orders | Update status |

### Admin Routes (Private)
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Dashboard | Statistics |
| `/admin/users` | Users | Manage users |
| `/admin/orders` | Orders | All orders |
| `/admin/categories` | Categories | Manage categories |

---

## Database Tables

Design your own schema for the following tables:

- **Users** - Store user information and authentication details
- **ProviderProfiles** - Provider/restaurant-specific information (linked to Users)
- **Categories** - Food categories (cuisine types)
- **Meals** - Menu items offered by providers
- **Orders** - Customer orders with items and status
- **Reviews** - Customer reviews for meals

> 💡 *Think about what fields each table needs based on the features above.*

---

## API Endpoints

> ⚠️ **Note**: These endpoints are examples. You may add, edit, or remove endpoints based on your implementation needs.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Meals & Providers (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | Get all meals with filters |
| GET | `/api/meals/:id` | Get meal details |
| GET | `/api/providers` | Get all providers |
| GET | `/api/providers/:id` | Get provider with menu |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order details |

### Provider Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/provider/meals` | Add meal to menu |
| PUT | `/api/provider/meals/:id` | Update meal |
| DELETE | `/api/provider/meals/:id` | Remove meal |
| PATCH | `/api/provider/orders/:id` | Update order status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/users/:id` | Update user status |

---

## Flow Diagrams

### 🍽️ Customer Journey

```
                              ┌──────────────┐
                              │   Register   │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Browse Meals │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Add to Cart  │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Checkout   │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Track Order  │
                              └──────────────┘
```

### 🍳 Provider Journey

```
                              ┌──────────────┐
                              │   Register   │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Add Menu    │
                              │    Items     │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ View Orders  │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │Update Status │
                              └──────────────┘
```

### 📊 Order Status

```
                              ┌──────────────┐
                              │    PLACED    │
                              └──────────────┘
                               /            \
                              /              \
                       (provider)       (customer)
                         starts          cancels
                            /                \
                           ▼                  ▼
                   ┌──────────────┐   ┌──────────────┐
                   │  PREPARING   │   │  CANCELLED   │
                   └──────────────┘   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    READY     │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  DELIVERED   │
                   └──────────────┘
```

---

## Submission

📋 **See [README.md](./README.md) for submission guidelines, timeline, and marks.**
