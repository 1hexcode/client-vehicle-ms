"use client";

import Link from "next/image";
import NextLink from "next/link";
import { MapPin, PhoneCall, Mail, Clock } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0F0F0F] border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <NextLink href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#F97316] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm font-outfit">V</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg font-outfit">Vehicle</span>
              <span className="text-[#F97316] font-bold text-lg font-outfit">MS</span>
            </div>
          </NextLink>
          <p className="text-gray-500 text-sm leading-relaxed">
            The premier destination for vehicle parts selling and inventory management. Quality parts, competitive prices, expert service.
          </p>
          <div className="flex gap-3">
            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-gray-500 hover:text-[#F97316] hover:border-[#F97316]/30 transition-all">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {["About Us", "Shop Parts", "My Account", "Order Tracking", "Wishlist", "Blog"].map(link => (
              <li key={link}><NextLink href="#" className="hover:text-[#F97316] transition-colors">{link}</NextLink></li>
            ))}
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {["Help Center", "Return Policy", "Shipping Info", "Privacy Policy", "Terms of Service", "FAQs"].map(link => (
              <li key={link}><NextLink href="#" className="hover:text-[#F97316] transition-colors">{link}</NextLink></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact Us</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-[#F97316] shrink-0 mt-0.5" />
              <span>Kathmandu, Nepal<br />Bagmati Province</span>
            </li>
            <li className="flex items-center gap-3">
              <PhoneCall size={16} className="text-[#F97316] shrink-0" />
              <span>+977 01-5555678</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#F97316] shrink-0" />
              <span>support@vehiclems.com</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock size={16} className="text-[#F97316] shrink-0" />
              <span>Mon-Sat: 08:00 - 19:00</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#222]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 VehicleMS — Vehicle Parts Selling & Inventory Management System. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="font-semibold text-gray-400">Visa</span>
            <span className="font-semibold text-gray-400">Mastercard</span>
            <span className="font-semibold text-gray-400">eSewa</span>
            <span className="font-semibold text-gray-400">Khalti</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
