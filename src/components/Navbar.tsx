import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-[1000] px-8 py-3 flex justify-between items-center">
      <div className="font-bold text-2xl tracking-tighter">
        VEHICLE<span className="text-primary">MS</span>
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <Link href="/" className="hover:text-primary">Home</Link>
        <Link href="/inventory" className="hover:text-primary">Inventory</Link>
        <Link href="/orders" className="hover:text-primary">Orders</Link>
        <Link href="/suppliers" className="hover:text-primary">Suppliers</Link>
        <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all">
          Dashboard
        </button>
      </div>
    </nav>
  );
}
