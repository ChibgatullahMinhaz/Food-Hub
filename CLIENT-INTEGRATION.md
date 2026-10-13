# FoodHub Client Integration Guide

**Stack:** Next.js App Router + TypeScript + Redux Toolkit + RTK Query + React Redux.

**Language:** Banglish. Ei guide current backend source-er upor based; assignment-er example API contract-er upor noy.

**Scope:** Phase-wise client implementation plan, actual API contract, starter patterns, backend blockers, and acceptance checklist. Phase 0 source-level fixes have been implemented and build-checked; Phase 1 RTK Query foundation and Phase 2 auth/profile routing are wired. Database-backed integration still needs a reachable database.

## 1. Age ei rules-gulo mone rakho

1. Backend local origin default `http://localhost:5000`; business API prefix `/api`.
2. Provider API spelling **`/api/prodivers`**. Frontend page `/providers/...` hote pare, kintu request-e backend-er exact spelling use korte hobe.
3. Order, review, category API singular: `/api/order`, `/api/review`, `/api/category`.
4. Auth Better Auth cookie/session based. JWT bearer token/localStorage auth flow invent korbe na.
5. Business API fetch-e `credentials: "include"` dite hobe.
6. Registration-e role choose kore server-e pathano supported noy. Default `CUSTOMER`; provider application approve hole role `PROVIDER` hoy.
7. Business API and Better Auth response format alada.
8. Server cart/order-ke source of truth dhoro. Client theke price, totalAmount, customerId ba cart items diye order create korbe na.
9. Section 3-er blockers resolve/verify na kore related phase-ke complete bolbe na.
10. Existing Client changes preserve koro; abar project scaffold/store provider recreate korar dorkar nei.

### Current client baseline

[Client/package.json](./Client/package.json)-e currently Next.js `16.4.0`, React `19.3.0`, Redux Toolkit `^2.13.0`, React Redux `^9.3.0` declared ache. Eta repository-r version snapshot, npm registry-r independently verified "latest" version claim noy. Ei existing modern App Router setup-e integrate koro; version upgrade alada task.

Already ache:

- [makeStore](./Client/store/store.ts): per-instance store factory, ekhono empty reducer.
- [StoreProvider](./Client/app/store-provider.tsx): stable store instance create kore.
- [Typed hooks](./Client/hooks/hooks.ts): typed dispatch/selector.
- [Root layout](./Client/app/layout.tsx): StoreProvider already wired.

## 2. Phase roadmap

| Phase | Deliverable | Depends on | Complete howar condition |
|---|---|---|---|
| 0 | Backend contract readiness + environment | None | Relevant blockers verified/fixed; health endpoint reachable |
| 1 | RTK Query foundation + shared types/error UI | 0 | Public query and protected error properly render |
| 2 | Register/login/logout/session + role navigation | 1 | Refresh-e session restore; logout-e private cache clear |
| 3 | Public meals/categories/provider details | 1 | Filters, detail, images, empty/error/loading states work |
| 4 | Customer cart | 2, 3 | Add/increment/update/remove/clear server-er sathe sync |
| 5 | Checkout + customer orders | 4 | One successful order, server cart empty, order detail visible |
| 6 | Reviews | 2, 3, 5 | Create/edit/delete own review; aggregate refresh |
| 7 | Provider application + menu/orders | 2, 3; approval needs Phase 8 | Approved provider nijer menu/order manage korte pare |
| 8 | Admin users/provider approval/categories/orders | 2 | Admin workflow verified, non-admin access rejected |
| 9 | Integration QA + deployment | All implemented phases | Browser cookie/CORS, role, pagination, upload, production checks pass |

**Suggested sequence:** 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> Phase 8-er approval slice -> 7 -> remaining 8 -> 9.

## 3. Phase 0: Backend readiness and known blockers

Ei section source inspection-er findings, runtime test report noy. Frontend workaround diye backend mismatch hide korbe na.

| Issue | Current source behavior | Integration action |
|---|---|---|
| Meal creation missing required field | Fixed in meal validation/service. New migration adds `preparationTime` with a temporary backfill default of 15 minutes, then removes the default | Build/schema validated; migration still needs to be applied and existing records/API behavior tested against the target database |
| Old meal image selectors | Cart, customer/provider order lists and order detail use the current `images: String[]` field; relevant cart/order/provider image responses are signed | Source and build checked; verify signed URLs against a live object store |
| Stale admin-user selects | User list uses schema fields `emailVerified`, `restaurantName`, and `status` | Source and build checked; verify payload against a live database |
| User ID validation mismatch | User route IDs now use CUID validation; `emailVerified` query filter is parsed | Source and build checked; test using a real user ID |
| Category update ID mismatch | Category update IDs use CUID validation; list limit is bounded and requested sorting is applied | Source and build checked; category list envelope intentionally remains nested and must be normalized by the client |
| Meal edit multipart types | PATCH validation now accepts typed JSON values and multipart numeric/boolean strings | Source and build checked; test mixed file/scalar multipart requests against the live API |
| Category list envelope | Controller service result puro `data`-te rakhe; shape `data: { meta, data: Category[] }` | Client normalize explicitly; top-level `meta` dhore categories read korbe na |
| Cursor pagination skips records | Meal, category, user, provider, order, and review list services now use the last returned row as nextCursor; ties use ID as a deterministic secondary sort | Build checked; multi-page no-missing/no-duplicate API test remains |
| Image representation inconsistent | Cart/order/provider image responses are signed. Meal/category create/update may still return storage keys | Refetch GET after mutations. Signed URL behavior still needs live object-store verification |
| No public provider list | Provider list endpoint admin-only; public route shudhu `/:id` | Public `/providers` directory promise korbe na; meal provider IDs theke detail link koro ba new API separately add koro |
| No own provider-profile lookup | Authenticated `GET /api/prodivers/me` returns the current user's provider profile/application or `null` | Source and build checked; test approved/pending/no-application cases with the live API |
| Provider rejected reapplication | Existing rejected application is updated rather than re-created | Source and build checked; verify status transition and reapply behavior with the live database |
| Auth origin config separate | Better Auth now receives the backend trusted-origin allowlist | Local auth-origin smoke check remains required; CORS success alone does not prove auth-origin acceptance |

`Client/.env.local` is configured for the documented local API/auth URLs. It is a local ignored environment file, not a committed deployment configuration.

Source references:

- [Route mounts](./Backend/src/routes/index.ts), [request validation](./Backend/src/middlewares/validateRequest.ts).
- [Meal schema](./Backend/src/prisma/schema/meal.prisma), [meal validation](./Backend/src/modules/meal/meal.validation.ts), [meal service](./Backend/src/modules/meal/meal.service.ts).
- [Cart service](./Backend/src/modules/cart/cart.service.ts), [order service](./Backend/src/modules/order/order.service.ts), [provider service](./Backend/src/modules/provider/provider.service.ts).
- [User schema](./Backend/src/prisma/schema/auth.prisma), [user service](./Backend/src/modules/users/users.service.ts), [user validation](./Backend/src/modules/users/user.validation.ts).
- [Category validation](./Backend/src/modules/category/category.validation.ts), [category controller](./Backend/src/modules/category/category.controller.ts).

### Local environment

Client-er `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:5000
```

`NEXT_PUBLIC_API_URL` includes `/api`; `NEXT_PUBLIC_AUTH_URL` shudhu backend origin. Auth client's default path `/api/auth`.

Backend environment-e verify:

- `PORT=5000`, `APP_URL=http://localhost:3000`.
- `BETTER_AUTH_URL=http://localhost:5000`.
- Valid `BETTER_AUTH_SECRET`, DB connection, Google credentials if social login enabled.
- R2 configuration if images read/upload kora hoy.
- Actual frontend origin Express CORS and Better Auth trusted origins-e accepted.

Secret, DB URL, Google client secret, R2 keys kokhono `NEXT_PUBLIC_*`-e rakhbe na.

Health request: `GET http://localhost:5000/api/health`.

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Server is healthy",
  "data": null
}
```

Health pass DB/R2/all endpoints healthy howar proof noy.

Backend startup console-e `Checking database connection...`-er por read-only `SELECT 1` query-r result log hoy: `Database connection successful.` ba `Database connection failed:` with error reason. Check fail hole server running thake, kintu database-backed requests fail korte pare. Eta startup snapshot, continuous database monitoring noy.

## 4. Phase 1: Redux + RTK Query foundation

### Responsibility split

- **RTK Query:** meals, categories, cart, orders, profile, reviews, admin/provider API server state.
- **Redux slices:** only shared mutable UI state, e.g. global drawer/modal.
- **URL search params:** search, category, price range, sort; shareable filter state.
- **Component/form state:** input values, selected `File[]`, validation messages.
- **Better Auth client:** session/auth lifecycle. Same session independently Redux-te duplicate korbe na.

React Server Components Redux hooks use korbe na. RTK hooks-er component-e `"use client"` lagbe. Existing makeStore/StoreProvider pattern retain koro; server-side singleton store create korbe na.

### Suggested additions (existing files recreate noy)

```text
Client\
  lib\
    auth-client.ts
    api-error.ts
  types\
    api.ts
    meal.ts
    cart.ts
    order.ts
  store\
    api\
      base-api.ts
      meal-api.ts
      category-api.ts
      profile-api.ts
      cart-api.ts
      order-api.ts
      review-api.ts
      provider-api.ts
      admin-api.ts
```

Feature API file names proposed. Phase 1 wires the shared `baseApi` plus meal and protected-profile queries; remaining features should use `baseApi.injectEndpoints()` rather than creating independent API stores.

### Shared response contracts

Business success response from [sendResponse](./Backend/src/utils/sendResponse.ts):

```ts
export interface CursorMeta {
  limit: number
  nextCursor?: string | null
  prevCursor?: string | null
  hasMore: boolean
  totalCount?: number
}

export interface ApiResponse<T, M = CursorMeta> {
  statusCode: number
  success: boolean
  message?: string
  meta?: M
  data: T
}

export interface ApiErrorBody {
  success: false
  message: string
  errorSources: Array<{ path: string | number; message: string }>
  stack?: string
}

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED"
export type ProviderStatus = "PENDING" | "APPROVED" | "REJECTED"
export type OrderStatus =
  | "PLACED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED"
```

Nullable endpoint-er jonno `ApiResponse<T | null>` explicitly use koro. JSON dates strings, JavaScript Date noy. `totalCount`/`prevCursor` sob list-e ase na. Review meta-te extra `totalReviews`, `averageRating` ache.

Business errors-er HTTP status read koro; error body-te `statusCode` always thakbe na:

```json
{
  "success": false,
  "message": "Validation Error",
  "errorSources": [{ "path": "quantity", "message": "Quantity must be greater than 0" }]
}
```

Development-e optional stack thakte pare; UI-te stack render korbe na. Better Auth-er errors ei shape follow kore na.

### Base API starter

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is required")

export const baseApi = createApi({
  reducerPath: "foodHubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
    credentials: "include",
  }),
  tagTypes: [
    "Meal", "Category", "Cart", "Order",
    "Review", "Profile", "Provider", "User",
  ],
  endpoints: () => ({}),
})
```

Existing [makeStore](./Client/store/store.ts)-e add korar pattern:

```ts
import { configureStore } from "@reduxjs/toolkit"
import { baseApi } from "@/store/api/base-api"

export const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
```

Headers-e global `Content-Type: application/json` force korbe na. RTK Query JSON body handle kore; FormData-r multipart boundary browser set korbe.

### Error/loading conventions

- `400`: field errors/backend message render; invalid quantity/image/empty cart.
- `401`: protected view close/redirect to login, private cache clear; original internal destination retain koro.
- `403`: forbidden/blocked-account screen; automatic repeated login/retry loop noy.
- `404`: not-found state, empty-list success noy.
- `409`: duplicate meal/category message.
- `5xx`, `FETCH_ERROR`, `PARSING_ERROR`, timeout: explicit retry/error state; success toast noy.
- Mutation-e `.unwrap()` + explicit catch/UI error. Form preserve koro on failure.
- Loading, empty, error alada states; failed request-ke `[]` banano noy.

**Phase 1 smoke checks:** Public meals query, invalid-limit validation response, and unauthenticated protected-profile error were verified in the temporary integration-check page. That page has been removed after verification; query endpoints and the reusable error component remain for feature pages.

## 5. Phase 2: Authentication + profile + route guards

Auth backend mount: `/api/auth/*`, from [app](./Backend/src/app.ts) and [auth config](./Backend/src/lib/auth.ts).

Client-e `better-auth@1.7.7` already installed and backend-er `^1.7.5` version-er sathe compatible. [auth client](./Client/lib/auth-client.ts) SDK-only `createAuthClient` use kore; auth calls-er jonno direct `fetch`/RTK Query use koro na.

```ts
import { createAuthClient } from "better-auth/react"

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL
if (!authUrl) throw new Error("NEXT_PUBLIC_AUTH_URL is required")

export const authClient = createAuthClient({
  baseURL: authUrl,
  fetchOptions: { credentials: "include" },
})
```

### Actual auth actions

| Action | HTTP endpoint | Request/client call |
|---|---|---|
| Register | POST `/api/auth/sign-up/email` | `{ name, email, password }`; `authClient.signUp.email(...)` |
| Login | POST `/api/auth/sign-in/email` | `{ email, password }`; `authClient.signIn.email(...)` |
| Restore/read session | GET `/api/auth/get-session` | `authClient.useSession()` / `getSession()` |
| Logout | POST `/api/auth/sign-out` | `authClient.signOut()` |
| Google login | POST `/api/auth/sign-in/social` | `{ provider: "google", callbackURL }`; `signIn.social(...)` |
| Business profile | GET `/api/admin/users/current/profile` | Any authenticated role; standard business envelope |

`/auth/register`, `/auth/login`, `/auth/me` assignment examples; ei backend-er actual email/session paths noy. Installed Better Auth routes-er satheo above paths checked.

Auth result `data/error` handle koro; business `ApiResponse` type diye auth payload cast korbe na. Session success shape session/user centered, unauthenticated get-session null hote pare.

### Flow

1. **Implemented:** `/register` Better Auth SDK diye name/email/password register kore; password confirmation local-e validate hoy, backend-e role pathay na. Successful register/login `/`-e redirect kore.
2. **Implemented:** `/login` Better Auth SDK diye email/password sign-in kore. “Keep me signed in” SDK-r `rememberMe` option control kore.
3. **Implemented:** Login and registration page theke Google OAuth SDK call kora hoy; callback frontend origin.
4. Backend `autoSignIn: true`, email verification required noy. Registration-er por session/profile verify kore redirect.
5. **Implemented:** `/dashboard` Better Auth session restore kore, then fresh business profile diye `{ id, name, email, role, status, createdAt, updatedAt }` load kore.
6. **Implemented:** Session pending thakle loading UI; absent session hole `/login`-e redirect. Private-role pages profile response na asha porjonto protected content render kore na.
7. **Implemented:** Active role profile diye destination choose koro:
   - CUSTOMER -> meals/orders.
   - PROVIDER -> provider dashboard.
   - ADMIN -> admin dashboard.
8. **Implemented:** Public landing navigation session-aware account menu dekhay. Logout Better Auth SDK diye hoy; success-e RTK Query cache reset hoy and public page-e return kore. Logout failure visible thake.
9. **Implemented:** Session-er user ID change hole app-level boundary private/server cache reset kore, so previous account-er cached profile/cart/order data reuse hoy na.

Better Auth additional user field currently shudhu `role`; `status` session user-e guaranteed noy. Business profile-te status read koro. Schema-er User type auth client-er sathe import/couple korbe na; client-er jonno safe DTO define koro.

### Profile editing

`PATCH /api/admin/users/:id` despite admin prefix:

- CUSTOMER/PROVIDER only nijer user ID update korte pare.
- Non-admin-er `role`/`status` controller remove kore.
- Customer profile UI currently only **name** edit offer korbe.
- Name minimum 2; body strict. Phone, address, email, avatar edit ei route-e supported noy.
- UUID mismatch blocker resolve/verify first.
- Success-e Profile tag invalidate + session refresh if UI session name use kore.

### Route protection

Client role guard UX-er jonno; backend authorization-ei authority. Protected data server response chara render korbe na.

Suggested private route groups:

- `(customer)` -> cart, checkout, orders, profile.
- `(provider)` -> provider dashboard/menu/orders.
- `(admin)` -> users/applications/categories/orders.

Route groups nijera access control kore na. Cross-origin backend cookie frontend domain-er server request-e nao aste pare; Next server layout/Proxy-te cookie automatically available dhore guard likhbe na. Strong server-side guard dorkar hole cookie-aware same-origin BFF/proxy architecture separately design koro.

**Phase 2 client flow:** Existing `app/(dashboard)` route group-er vitore `/dashboard`, `/customer`, `/seller`, and `/admin` routes implement kora. Route group-er nijer URL segment nei; seller route-er client role `PROVIDER`. Session/profile routing, role mismatch redirect, non-active profile screen, and logout UI browser-e validate koro. Live login/registration, role-specific accounts, OAuth callback, DB-backed profile, and account-switch cache behavior target database/Google credentials reachable thakle end-to-end verify korte hobe. Better Auth backend session-create hook BLOCKED/SUSPENDED reject kore; backend authorization final authority.

## 6. Phase 3: Public browsing

**Implemented in Client:** `/shop` supports URL-backed search, category, vegetarian,
dietary type, price-range, and sort filters; available meals explicitly query
`isAvailable=true` and use cursor-based load-more. `/shop/[id]` shows meal details
and signed-image gallery. `/categories` and `/categories/[id]` browse categories
and their available meals. `/providers/[id]` shows the public restaurant profile
and the complete available menu through the meals endpoint. Loading, retryable
errors, empty results, and 404 states are explicit. Landing-page menu actions
link to `/shop`.

Client RTK Query endpoints are in `Client/store/api/meal-api.ts`,
`Client/store/api/category-api.ts`, and `Client/store/api/provider-api.ts`.
Live API rendering still depends on the configured backend/database and object
storage being reachable; previous integration attempts encountered backend
database DNS/connectivity errors, so data-backed browser flows need a reachable
environment for end-to-end verification.

### Endpoints

| Method | Endpoint | Auth | Result in business `data` |
|---|---|---|---|
| GET | `/api/meals` | Public | Meal[]; pagination outer `meta` |
| GET | `/api/meals/:id` | Public | Meal with category + provider detail |
| GET | `/api/category` | Public | **`{ meta, data: Category[] }`** |
| GET | `/api/category/:id` | Public | Category |
| GET | `/api/prodivers/:id` | Public | ProviderProfile + user + first 10 available meals + meal count |
| GET | `/api/review/meal/:mealId` | Public | Reviews[] + aggregate in outer meta |
| GET | `/api/review/provider/:providerId` | Public | Reviews[] + aggregate in outer meta |

Provider detail old image select blocker ache. Embedded meals first 10 only; full provider menu-r jonno `GET /api/meals?providerId=<profile-id>&isAvailable=true` use koro.

### Meal query params

| Field | Supported values/default |
|---|---|
| `cursor` | Opaque returned ID, optional |
| `limit` | Default 10, 1-100 |
| `search` | Name/description substring |
| `categoryId`, `providerId` | Returned CUIDs; providerId = profile ID, user ID noy |
| `isAvailable`, `isVegetarian` | Query strings `"true"` / `"false"` |
| `dietaryType` | Case-insensitive substring |
| `minPrice`, `maxPrice` | Numeric query strings; UI-te finite nonnegative values + min <= max validate |
| `sortBy` | `price`, `createdAt`, `name`; default `createdAt` |
| `sortOrder` | `asc`, `desc`; default `desc` |

Example: `/api/meals?search=rice&isAvailable=true&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc&limit=12`.

Public available-menu UI-te explicitly `isAvailable=true` dao; backend default public query available-only noy.

### Minimum browsing DTO

```ts
export interface MealListItem {
  id: string
  name: string
  description: string
  price: number
  preparationTime: number
  images: string[]
  isAvailable: boolean
  isVegetarian: boolean
  dietaryType: string | null
  providerId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category: { id: string; name: string; slug: string }
  provider: { id: string; restaurantName: string }
}
```

Detail DTO separate rakho: category full object, provider includes address/phone. Mutation DTO-ke list DTO dhore nio na; relations/properties differ.

Meal hooks pattern:

```ts
import { baseApi } from "./base-api"
import type { ApiResponse } from "@/types/api"
import type { MealListItem } from "@/types/meal"

type MealListParams = Record<string, string | number | boolean>

export const mealApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeals: builder.query<ApiResponse<MealListItem[]>, MealListParams>({
      query: (params) => ({ url: "/meals", params }),
      providesTags: ["Meal"],
    }),
  }),
})

export const { useGetMealsQuery } = mealApi
```

Ei params type starter only; implementation-e above supported fields-er explicit interface use koro. Unset params omit koro, empty CUID/filter pathabe na.

### Categories + pagination caveats

- Category query supports `cursor`, `limit` default 10, `search`, `sortBy=name|createdAt`, `sortOrder`.
- Current category service `sortBy=name|createdAt` and `sortOrder` apply kore; cursor tie-breaker ID diye.
- Category list normalize from `response.data.data` and `response.data.meta`. Onno lists `response.data` and `response.meta`.
- Reviews query `cursor`, `limit` default 10. Meta includes `totalReviews`, `averageRating`.
- Cursor fix-er por next page-e returned nextCursor pathao, hasMore=false hole stop.
- Search/filter/sort change hole cursor history and accumulated items reset.
- Current API-te page number/totalPages supported noy. "Load more" simplest UX.

### Images

- GET meals gives `images[]` signed URLs, category GET gives nullable signed `image`.
- Meal card first image + intentional no-image placeholder; detail gallery supports array.
- Signed URL default helper expiry 3600 seconds. Expired image URL hole fresh GET/refetch; old signed URL permanently persist korbe na.
- R2 `remotePatterns` exact storage host/path diye configure koro if Next Image use koro; arbitrary wildcard allow korbe na. Query-changing signed URLs-er sathe config verify koro.
- Raw storage key-ke direct browser URL dhore render korbe na.

**Done:** filters/shareable URL, detail navigation, gallery, no results, 404, provider menu, multi-page records without gaps.

## 7. Phase 4: Server-backed customer cart

**Implemented in Client:** `/cart` loads the signed-in account's cart from
`GET /api/cart`; guest users are prompted to sign in and return to the cart.
Meal detail pages can add available meals through `POST /api/cart/items`.
Quantity controls send absolute values to `PATCH /api/cart/items/:itemId`,
removal uses the cart-item ID, and clearing requires confirmation. Every
successful mutation invalidates and reloads the server cart so its subtotal
remains authoritative. RTK Query requests include the existing Better Auth
session cookies, and account changes reset the API cache through the shared
session boundary.

Types and endpoints live in `Client/types/cart.ts` and
`Client/store/api/cart-api.ts`; cart UI is in `Client/components/cart/`.
Checkout remains disabled until Phase 5.

All cart routes auth require kore; route-e role restriction nei. Customer-facing UI-te cart show koro, backend supports any logged-in role.

| Method | Endpoint | Payload | `data` shape |
|---|---|---|---|
| GET | `/api/cart` | None | Cart + items + subtotal; no cart hole `{ id: null, items: [], subtotal: 0 }` |
| POST | `/api/cart/items` | `{ mealId, quantity }` | Added/updated CartItem, **not whole cart** |
| PATCH | `/api/cart/items/:itemId` | `{ quantity }` | Updated CartItem |
| DELETE | `/api/cart/items/:itemId` | None | Deleted CartItem |
| DELETE | `/api/cart` | None | Message object |

- POST quantity default 1, positive integer; existing same meal hole quantity **increment** kore.
- PATCH quantity positive integer and **replace** kore.
- Quantity 0 send korbe na; remove endpoint use koro.
- Update/delete-e cart **itemId**, mealId noy.
- Add unavailable meal rejected; server subtotal trust koro.
- Cart read includes meal ID/name/price/images/availability and provider ID/name;
  add/update return a cart item with meal ID/name/price/images/provider ID.
- Guest cart API nei. Guest add button login-e redirect korte pare; local guest-cart merge separate feature.

RTK endpoint pattern below existing `Cart`/`CartItem` DTO files define korar por use koro:

```ts
import { baseApi } from "./base-api"
import type { ApiResponse } from "@/types/api"
import type { Cart, CartItem } from "@/types/cart"

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<Cart>, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addCartItem: builder.mutation<
      ApiResponse<CartItem>,
      { mealId: string; quantity: number }
    >({
      query: (body) => ({ url: "/cart/items", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
  }),
})

export const { useGetCartQuery, useAddCartItemMutation } = cartApi
```

Same Cart invalidation update/remove/clear-e apply koro. Initial integration-e pessimistic refresh simplest; optimistic updates later with rollback only.

**Done:** reload-e cart retain, duplicate add increments, absolute quantity edit, remove, clear, unavailable item/error, account-switch isolation.

## 8. Phase 5: Checkout + orders

**Implemented in Client:** `/checkout` submits the signed-in customer's
server-backed cart with delivery address, contact phone, optional instructions,
and cash-on-delivery only. The UI validates the backend's minimum lengths,
does not send a client-calculated order total, disables repeated submission
while pending, and sends a successful order to `/orders/[id]`. Failed checkout
shows the server error and directs the user to reconcile in order history
before manually retrying; it never retries order creation automatically.

`/orders` supports status filters, cursor pagination, refresh, and active-order
polling; `/orders/[id]` shows status progress, delivery details, and item
price snapshots, and offers cancellation only while status is `PLACED`.
`/seller/orders` and `/admin/orders` provide incoming/all order lists and
forward-only status actions through the documented lifecycle. Order detail
polls every 30 seconds only while non-terminal and the page is visible. The
backend remains the authority for ownership, roles, availability, and status.

Order DTOs and RTK Query endpoints are in `Client/types/order.ts` and
`Client/store/api/order-api.ts`; checkout and order views are in
`Client/components/orders/`.

| Method | Endpoint | Role/ownership | Payload/result |
|---|---|---|---|
| POST | `/api/order` | CUSTOMER | Checkout body -> one Order with items |
| GET | `/api/order/my-orders` | CUSTOMER | Own Order[] + outer meta |
| GET | `/api/order/:id` | Auth; own customer, involved provider, or ADMIN | Order detail |
| PATCH | `/api/order/:id/cancel` | CUSTOMER; own order | Only PLACED order cancel |
| GET | `/api/order/provider-orders` | PROVIDER or ADMIN | Provider-related orders; ADMIN gets all |
| PATCH | `/api/order/:id/status` | Involved PROVIDER or ADMIN | `{ status }` -> Order + items |

Checkout body:

```json
{
  "deliveryAddress": "House 12, Road 4, Dhaka",
  "contactPhone": "01700000000",
  "paymentMethod": "CASH_ON_DELIVERY",
  "specialInstructions": "Please call before delivery"
}
```

- Address min 5, contactPhone min 10.
- paymentMethod/specialInstructions optional. Backend default payment method `CASH_ON_DELIVERY`.
- Online payment integration/payment intent/webhook API nei. Arbitrary string accept korleo UI-te supported COD only offer koro.
- Order source current server cart. Server current meal price diye total and OrderItem price snapshot create kore.
- Create transaction order save + cart clear kore. Success hole `Order` and `Cart` tags invalidate.
- Empty cart/unavailable meal hole 400; checkout-e error show, fake order create noy.
- Submit button in-flight-e disable koro. Backend idempotency key support nei; timeout-er por blind automatic POST retry noy, order history/cart check kore reconcile koro.
- Mixed-provider cart-ke current service block kore na; single order-e sob items thake. Provider status update **whole order** change kore, per-provider fulfillment noy. Single-provider rule add korle intentional new behavior/backend support lagbe.

Order queries: `cursor`, `limit` default 10 positive integer, optional `status` enum. UI reasonable limit, e.g. 10/20 rakho.

Expected display progression: `PLACED -> PREPARING -> READY -> DELIVERED`, plus `CANCELLED`. Current status service transition rules enforce kore na; full enum-e update korte pare. UI-te intended progression show kora UX only, backend guarantee noy.

OrderItem display `quantity * item.price`, current `meal.price` noy. Customer cancel action only PLACED-e show koro.

Tracking initial approach manual refresh/polling (e.g. 30s while order nonterminal and screen active). WebSocket/live tracking API nei.

**Done:** checkout success/cart clear, failed submit, price snapshot, list/filter/detail, own PLACED cancel, processed cancel rejected, forbidden other-user order.

## 9. Phase 6: Reviews

| Method | Endpoint | Access | Body |
|---|---|---|---|
| GET | `/api/review/meal/:mealId` | Public | Query cursor/limit |
| GET | `/api/review/provider/:providerId` | Public | Query cursor/limit |
| POST | `/api/review` | CUSTOMER | `{ mealId, orderId?, rating, comment }` |
| PATCH | `/api/review/:id` | CUSTOMER; own review | `{ rating?, comment? }` |
| DELETE | `/api/review/:id` | Owner or ADMIN, authenticated | None |

- Rating integer 1-5, comment min 3.
- orderId optional; supplied hole server checks own order and meal included.
- Current backend DELIVERED status require kore na. Delivered-only review UI reasonable product rule, kintu backend-e enforce ache bolbe na.
- Duplicate same customer + meal + orderId/null review reject kore.
- Order details-e review button-e proper **order ID**, meal ID dao; OrderItem ID pathabe na.
- Create/update/delete -> `Review` invalidate; aggregate rating/count refresh.
- Review details include customer `{id,name}`; provider review list meal `{id,name}`-o include kore.

**Done:** review lifecycle + duplicate/ownership errors + aggregate refresh; optional orderId semantics tested.

## 10. Phase 7: Provider application + dashboard

### Application

`POST /api/prodivers/apply` -> CUSTOMER or ADMIN; JSON without image, FormData with optional `image`.

| Field | Validation |
|---|---|
| restaurantName | Required, min 3 |
| address | Required, min 5 |
| phone | Required, min 10 |
| description | Optional string |
| cuisineType | Optional string |
| image | Optional single file, stored as bannerImage key |

Response data: `id, userId, restaurantName, description, bannerImage, cuisineType, address, phone, isOpen, status, createdAt`. Initial status `PENDING`.

- CUSTOMER application submit korlei provider role hoy na.
- Admin APPROVED korle user's role PROVIDER hoy; fresh profile/session fetch kore navigation update koro.
- PENDING duplicate application and already approved application rejected.
- Rejected reapply currently blocker; button advertise korbe na before fix.
- Own provider-profile recovery endpoint absent; localStorage-e remembered profileId-ke permanent authority dhorbe na.
- Existing provider profile editing/isOpen toggle route nei; unsupported settings UI defer koro.

### Menu management

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/api/meals` | PROVIDER only | FormData create |
| PATCH | `/api/meals/:id` | Owner PROVIDER or ADMIN | JSON scalar edit / limited FormData |
| DELETE | `/api/meals/:id` | Owner PROVIDER or ADMIN | None |
| GET | `/api/meals?providerId=<profile-id>` | Public | Own-menu filter, include unavailable items by omitting isAvailable |

Create fields:

- Required: name min 2, description min 10, price positive, categoryId valid CUID.
- `preparationTime` validation accepts optional integer, but required schema + missing persistence blocker **must fix first**.
- Optional: isAvailable (default true), isVegetarian (default false), dietaryType.
- `providerId` accepted in validation but service uses logged-in provider profile; client should omit.
- Files: repeated **`images`**, max 5, accepted MIME/extension JPEG/PNG/WEBP/AVIF/GIF, max **5 MiB per file**.
- Validator intends at least one file if files provided; client require 1-5 on create. No-image POST runtime behavior verify after readiness fix.

FormData example (browser File[] form state):

```ts
const body = new FormData()
body.append("name", values.name)
body.append("description", values.description)
body.append("price", String(values.price))
body.append("preparationTime", String(values.preparationTime))
body.append("categoryId", values.categoryId)
body.append("isAvailable", String(values.isAvailable))
body.append("isVegetarian", String(values.isVegetarian))
if (values.dietaryType) body.append("dietaryType", values.dietaryType)
for (const file of selectedFiles) body.append("images", file)
```

Eta request construction example, current meal-create blocker-r workaround noy.

Edit:

- PATCH scalar JSON: name, description, price, categoryId, isAvailable, isVegetarian, dietaryType.
- preparationTime current update validation/service-e nei; edit disabled until support added.
- New image files supplied hole existing image array **replace** hoy; append/remove-specific image API nei.
- Multipart-e number/boolean pathale string hoy, PATCH reject korte pare. Single combined edit guarantee korbe na; coercion fix recommended. Two separate requests transactionally atomic noy.
- Mutation result storage keys hote pare; list/detail GET refetch kore signed images use koro.
- Related historical order items thakle meal delete DB restriction fail korte pare; explicit error show, `isAvailable=false` alternative UX offer koro.

### Provider orders

GET `/api/order/provider-orders`, PATCH `/api/order/:id/status`.

Provider-order list customer contact/basic relation and items show koro. Current list includes whole matching order, not provider-only item projection; mixed-provider behavior above follow koro.

**Done:** customer apply -> admin approve -> role refresh -> own menu -> incoming order -> allowed status action; other provider meal edit rejected.

## 11. Phase 8: Admin dashboard

### User management

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | `cursor`, `limit` default 10 max 100, `search`, `role`, `status` |
| GET | `/api/admin/users/:id/details` | ADMIN | User + latest 5 orders + count |
| PATCH | `/api/admin/users/:id` | ADMIN / self for non-admin | name, role, status |
| DELETE | `/api/admin/users/:id` | ADMIN | Data constraints can reject deletion |
| GET | `/api/admin/users/current/profile` | Any authenticated user | Current safe profile DTO |

User list stale selectors and UUID mismatch first fix/verify. `isEmailVerified` filtering exists in service interface but route/controller publicly wires na; UI param offer korbe na.

Status enum ACTIVE/SUSPENDED/BLOCKED. SUSPENDED/BLOCKED update hole user's sessions delete hoy; tar next protected request-e auth error expect koro.

Delete action confirmation required. Orders restrict user deletion; failed delete-ke silently list theke remove korbe na.

### Provider approval

| Method | Endpoint | Query/body |
|---|---|---|
| GET | `/api/prodivers/all/provider` | cursor, limit default 10 max 100, status, search, sortOrder asc/desc |
| PATCH | `/api/prodivers/:id/status` | `{ "status": "APPROVED" }` or REJECTED |

Here `id` provider profile ID, user ID noy.

Validator full ProviderStatus enum accept kore, including PENDING, despite message APPROVED/REJECTED. Normal approval UI-te APPROVED/REJECTED only dao.

APPROVED promotes user role. REJECTED/PENDING set korle existing provider role automatically demote hoy na; revoke-provider workflow guaranteed noy.

### Category management

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/api/category` | ADMIN or PROVIDER | `{ name }` JSON, or FormData name + optional `image` |
| PATCH | `/api/category/:id` | ADMIN | name optional + optional image |
| DELETE | `/api/category/:id` | ADMIN | None |

Name min 2; backend generates slug, duplicate name/slug conflicts. Category with meals cannot delete. Category PATCH CUID2 blocker resolve first.

### Admin orders + reviews

- All orders = `GET /api/order/provider-orders` as ADMIN; `/api/admin/orders` API nei.
- Order detail/status uses shared `/api/order/:id` endpoints.
- Review delete ADMIN supported, but all-reviews moderation list endpoint nei; meal/provider review views theke moderation possible.
- Dedicated dashboard statistics API nei. Paginated list-er length-ke total business count/revenue bolbe na. Stats API separately add korte hobe or verified available aggregate use koro.

**Done:** admin guard, users filters/status, provider approval, category lifecycle, all-orders/status, ownership and DB-error UX.

## 12. Cache invalidation map

| Mutation/event | Invalidate/refetch |
|---|---|
| Login/new account | Reset old private API state; fetch current profile/cart on demand |
| Logout/session expiry | Skip/unmount private queries + resetApiState |
| Add/update/remove/clear cart | Cart |
| Create order | Cart + Order |
| Cancel/update order status | Order |
| Create/update/delete meal | Meal + Provider; Cart if meal availability/price changes |
| Create/update/delete category | Category + Meal (embedded category data) |
| Create/update/delete review | Review |
| Apply provider | Provider |
| Approve/reject provider | Provider + User + Profile; affected user's role fetched fresh in their session |
| Update/delete user | User + Profile; refresh current session if relevant |

Start coarse tags diye, pore per-ID + LIST tags optimize koro. Mutation responses-er partial relations diye full cached list replace korbe na.

## 13. Phase 9: Integration QA and deployment

### Functional acceptance checklist

- [ ] Health endpoint works; relevant backend blockers resolved with real API tests.
- [ ] Register -> auto login -> refresh -> logout -> different account login correct.
- [ ] Customer/provider/admin pages wrong role-e denied; backend 401/403 tested.
- [ ] Actual frontend origin accepted by both CORS and Better Auth.
- [ ] Meals filters/query params/detail/gallery/category nested list work.
- [ ] Pagination first + next pages have no missing/duplicated IDs; filters reset cursor.
- [ ] Cart add increments; edit replaces; remove uses itemId; zero quantity rejected.
- [ ] Checkout uses server cart; success clears it; disabled submit prevents double clicks.
- [ ] Create-order timeout isn't automatically retried; history reconciliation works.
- [ ] PLACED own order cancel works; processed cancellation rejected.
- [ ] Reviews validation, duplicate, ownership, aggregate refresh work.
- [ ] Provider approval grants role; app reload can recover own provider profile.
- [ ] Meal create persists preparationTime; image field names/count/size/type tested.
- [ ] Scalar JSON edit and image edit behavior verified; replacement explicit in UI.
- [ ] Admin category/user IDs accepted; stale selectors resolved.
- [ ] Offline/5xx/upload failure shows explicit errors, not fake empty/success state.
- [ ] Old user's private cache isn't visible after logout/account switch.
- [ ] Private data not placed in public Next caches or persisted localStorage.
- [ ] Client lint/build pass using existing project scripts after implementation.

No integration tests presently proved by this document. Each checklist related feature implement korar por mark koro; scaffold compilation alone enough noy.

### Production cookies/CORS

1. HTTPS backend + frontend; correct public frontend and backend URLs at build/deploy time.
2. `credentials: "include"` alone cross-site browser restrictions bypass kore na.
3. Current backend production-e secure cookies enable kore; explicit cross-subdomain setup commented out. SameSite/domain settings assumed configured bolbe na.
4. Frontend and backend different sites hole SameSite/third-party cookie restrictions test koro; suitable auth cookie config or same-origin BFF strategy choose koro. Same-site subdomains and totally different sites alada scenarios.
5. CORS-e exact allowed origin + credentials, `*` noy. Better Auth origin allowlist separately configure/verify.
6. Google OAuth authorized callback backend-er `/api/auth/callback/google`; successful return frontend-er allowed callbackURL. Credentials and redirect URLs provider console-e verify koro.
7. Cross-origin redirect and Set-Cookie actually browser-e accepted hocche kina devtools Network/Application diye check koro. Postman success browser-cookie success-er proof noy.
8. R2 URLs/expiry and Next Image production hostname verify koro.
9. Never ship backend secrets or expose session token in Redux persistence.

## 14. Quick implementation handoff

**Prothom coding batch:** blockers verify/fix -> baseApi wire -> business error utility -> auth client -> profile query -> login/register/logout.

**Second batch:** meals/category normalization/detail/provider links -> filters/pagination -> cart.

**Third batch:** checkout/orders -> reviews -> admin approval slice -> provider menu/orders.

**Final batch:** remaining admin pages -> QA -> production cookie/CORS checks.

Ei guide-er API contract [backend routes](./Backend/src/routes/index.ts), module route/validation/controller/service files and [Prisma schema](./Backend/src/prisma/schema)-er sathe traced. Original [assignment specification](./2-FoodHub.md)-er illustrative endpoints/features-er cheye current implementation authoritative.

Redux architecture reference: [Official Redux Toolkit / Next.js App Router guide](https://redux.js.org/usage/nextjs).
