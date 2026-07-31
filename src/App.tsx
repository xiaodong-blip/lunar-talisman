import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Moon } from 'lucide-react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const CollectionPage = lazy(() =>
  import('./pages/CollectionPage').then((module) => ({
    default: module.CollectionPage,
  })),
)
const ProductPage = lazy(() =>
  import('./pages/ProductPage').then((module) => ({
    default: module.ProductPage,
  })),
)
const QuizPage = lazy(() =>
  import('./pages/QuizPage').then((module) => ({ default: module.QuizPage })),
)
const BlogPage = lazy(() =>
  import('./pages/BlogPage').then((module) => ({ default: module.BlogPage })),
)
const BlogPostPage = lazy(() =>
  import('./pages/BlogPostPage').then((module) => ({
    default: module.BlogPostPage,
  })),
)
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })),
)
const CartPage = lazy(() =>
  import('./pages/CartPage').then((module) => ({ default: module.CartPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function LoadingScreen() {
  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-chakra-crown">
      <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full border border-chakra-crown/25 bg-card">
        <Moon size={28} fill="currentColor" strokeWidth={1.4} />
      </span>
      <p className="text-sm uppercase tracking-[0.28em] text-text-muted">
        Loading moonlight
      </p>
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <main className="pt-[72px]">
      <Suspense fallback={<LoadingScreen />}>
        <div key={location.pathname} className="route-fade">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Suspense>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <div className="site-shell">
        <Navbar />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
