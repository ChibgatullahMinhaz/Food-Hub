import Link from "next/link"
import { AccountNavigation } from "@/components/auth/auth-navigation";

const dishes = [
  {
    name: "Sunshine grain bowl",
    description: "Avocado, sweet potato, greens & tahini",
    price: "$12.90",
    tag: "Bestseller",
    image: "dish-photo--bowl",
  },
  {
    name: "The crispy chicken",
    description: "Golden chicken, pickles & house sauce",
    price: "$14.50",
    tag: "Fan favorite",
    image: "dish-photo--chicken",
  },
  {
    name: "Garden pesto pasta",
    description: "Fresh basil pesto, parmesan & cherry tomato",
    price: "$13.25",
    tag: "Veggie",
    image: "dish-photo--pasta",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.25 10h11.5m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
      <path d="m10 1.5 2.54 5.15 5.68.83-4.11 4.01.97 5.66L10 14.48l-5.08 2.67.97-5.66-4.11-4.01 5.68-.83L10 1.5Z" />
    </svg>
  );
}

export default function Home() {

  return (
    <main className="landing-page">
      <div className="announcement">
        <span className="announcement__sparkle" aria-hidden="true">
          ✳
        </span>
        Your first order is 20% off{" "}
        <span className="announcement__divider">·</span>{" "}
        <Link href="/shop">Dig in now</Link>
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="FoodHub home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M5 17h22l-2.3 8.1a3 3 0 0 1-2.9 2.2H10.2a3 3 0 0 1-2.9-2.2L5 17Z"
                fill="currentColor"
              />
              <path
                d="M3.5 16.5h25M10 12c0-1.5 1-2.2 1-3.7M16 12c0-1.5 1-2.2 1-3.7M22 12c0-1.5 1-2.2 1-3.7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.2"
              />
            </svg>
          </span>
          <span className="brand__name">
            food<span>hub</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a className="main-nav__link main-nav__link--active" href="#home">
            Home
          </a>
          <Link className="main-nav__link" href="/shop">
            Our menu
          </Link>
          <a className="main-nav__link" href="#why-us">
            Our story
          </a>
        </nav>

        <div className="header-actions">
          <AccountNavigation />
          <Link className="text-link" href="/cart">
            Cart
          </Link>
          <Link className="header-cta" href="/shop">
            Order now <ArrowIcon />
          </Link>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero__copy">
          <div className="eyebrow">
            <span className="eyebrow__dot" />
            GOOD FOOD, GOOD MOOD
          </div>
          <h1>
            A little joy
            <br />
            in <span>every bite.</span>
          </h1>
          <p className="hero__description">
            Feel-good food made fresh, delivered with love. Your next favorite
            meal is just around the corner.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/shop">
              Explore the menu <ArrowIcon />
            </Link>
            <a className="text-link" href="#why-us">
              How it works <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar avatar--one">J</span>
              <span className="avatar avatar--two">M</span>
              <span className="avatar avatar--three">A</span>
              <span className="avatar avatar--four">+</span>
            </div>
            <div>
              <div className="hero-proof__rating">
                <StarIcon /> <strong>4.9/5</strong>
                <span>from happy eaters</span>
              </div>
              <p>Loved by 12,000+ hungry humans</p>
            </div>
          </div>
        </div>

        <div
          className="hero-visual"
          role="img"
          aria-label="Fresh colorful grain bowl with greens and avocado"
        >
          <div className="hero-visual__photo" />
          <div className="hero-visual__sun" />
          <div className="delivery-card">
            <span className="delivery-card__icon" aria-hidden="true">
              ↗
            </span>
            <span>
              <strong>Fresh to your door</strong>
              <small>In about 25 minutes</small>
            </span>
          </div>
          <div className="fresh-stamp" aria-label="Made fresh daily">
            <span>✳</span>
            <small>
              MADE
              <br />
              FRESH
              <br />
              DAILY
            </small>
          </div>
          <span className="hero-visual__caption">
            Real ingredients. Really good food.
          </span>
        </div>
      </section>

      <section className="benefits" id="why-us" aria-label="Why choose FoodHub">
        <div className="benefit">
          <span
            className="benefit__icon benefit__icon--green"
            aria-hidden="true"
          >
            ✳
          </span>
          <span>
            <strong>Fresh, always</strong>
            <small>Made to order, never waiting around</small>
          </span>
        </div>
        <div className="benefit">
          <span
            className="benefit__icon benefit__icon--peach"
            aria-hidden="true"
          >
            ⌁
          </span>
          <span>
            <strong>Good for you</strong>
            <small>Real ingredients you can feel good about</small>
          </span>
        </div>
        <div className="benefit">
          <span
            className="benefit__icon benefit__icon--yellow"
            aria-hidden="true"
          >
            ♡
          </span>
          <span>
            <strong>Right on time</strong>
            <small>At your door, warm and wonderful</small>
          </span>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow__dot" />
              MADE WITH A LITTLE EXTRA LOVE
            </div>
            <h2>Today’s feel-good picks</h2>
          </div>
          <Link className="text-link section-heading__link" href="/shop">
            See the full menu <ArrowIcon />
          </Link>
        </div>

        <div className="dish-grid">
          {dishes.map((dish) => (
            <article className="dish-card" key={dish.name}>
              <div className={`dish-photo ${dish.image}`}>
                <span className="dish-tag">{dish.tag}</span>
                <button
                  className="dish-save"
                  type="button"
                  aria-label={`Save ${dish.name}`}
                >
                  ♡
                </button>
              </div>
              <div className="dish-details">
                <div>
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                </div>
                <strong className="dish-price">{dish.price}</strong>
              </div>
              <Link className="dish-order" href="/shop">
                Browse the menu <span aria-hidden="true">+</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand brand--footer" href="#home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M5 17h22l-2.3 8.1a3 3 0 0 1-2.9 2.2H10.2a3 3 0 0 1-2.9-2.2L5 17Z"
                fill="currentColor"
              />
              <path
                d="M3.5 16.5h25M10 12c0-1.5 1-2.2 1-3.7M16 12c0-1.5 1-2.2 1-3.7M22 12c0-1.5 1-2.2 1-3.7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.2"
              />
            </svg>
          </span>
          <span className="brand__name">
            food<span>hub</span>
          </span>
        </a>
        <p>Made with love. Served with a smile. © 2026 FoodHub</p>
        <a href="#home" className="back-to-top">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
}
