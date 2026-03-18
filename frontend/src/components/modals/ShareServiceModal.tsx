import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Copy, Download, Link2, MessageCircle, Mail,
    Twitter, Linkedin, Edit3, Check, Smartphone,
    Code, Calendar, ExternalLink, Instagram, Facebook, Send,
    Share2, QrCode
} from "lucide-react";
import { FaWhatsapp, FaLinkedin, FaTwitter, FaInstagram, FaFacebook, FaTelegram, FaLink } from "react-icons/fa";

import { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ShareServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

export default function ShareServiceModal({ isOpen, onClose, service }: ShareServiceModalProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("shorten");
    const [isEditingLink, setIsEditingLink] = useState(false);

    // Dynamic URL construction
    const bookingUrl = service ? `${window.location.origin}/book/s/${service.id}` : "";
    const [displayUrl, setDisplayUrl] = useState(bookingUrl);

    useEffect(() => {
        if (service) {
            setDisplayUrl(`${window.location.origin}/book/s/${service.id}`);
        }
    }, [service]);

    if (!isOpen || !service) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(displayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQR = () => {
        const qrContent = displayUrl || bookingUrl;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
        const link = document.createElement("a");
        link.href = qrUrl;
        link.download = `QR-${service.name}.png`;
        link.target = "_blank";
        link.click();
    };

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: FaWhatsapp,
            color: "bg-[#25D366]",
            url: `https://wa.me/?text=${encodeURIComponent(`Book an interview for ${service.name}: ${displayUrl}`)}`
        },
        {
            name: "LinkedIn",
            icon: FaLinkedin,
            color: "bg-[#0077B5]",
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(displayUrl)}`
        },
        {
            name: "Twitter",
            icon: FaTwitter,
            color: "bg-[#1DA1F2]",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Book an interview for ${service.name}:`)}&url=${encodeURIComponent(displayUrl)}`
        },
        {
            name: "Facebook",
            icon: FaFacebook,
            color: "bg-[#1877F2]",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(displayUrl)}`
        },
        {
            name: "Telegram",
            icon: FaTelegram,
            color: "bg-[#0088cc]",
            url: `https://t.me/share/url?url=${encodeURIComponent(displayUrl)}&text=${encodeURIComponent(`Book an interview for ${service.name}`)}`
        },
        {
            name: "Instagram",
            icon: FaInstagram,
            color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
            onClick: () => {
                handleCopy();
                alert("Link copied! You can now paste it in your Instagram bio or story.");
            }
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-slate-600",
            url: `mailto:?subject=${encodeURIComponent(`Booking: ${service.name}`)}&body=${encodeURIComponent(`You can book an interview for ${service.name} here: ${displayUrl}`)}`
        },
    ];

    const tabs = [
        { id: "shorten", label: "Shorten Link", icon: Link2 },
        { id: "one-time", label: "One time Link", icon: Smartphone },
        { id: "embed", label: "Embed as Widget", icon: Code },
        { id: "slots", label: "Copy Time Slots", icon: Calendar }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Share - <span className="text-slate-600 font-medium">{service.name}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                                <Link2 className="w-4 h-4 text-slate-400 mr-2" />
                                <input
                                    type="text"
                                    readOnly={!isEditingLink}
                                    value={displayUrl}
                                    onChange={(e) => setDisplayUrl(e.target.value)}
                                    className="w-full bg-transparent border-none focus:outline-none text-slate-600 font-medium text-sm pr-10"
                                />
                                <button
                                    onClick={() => setIsEditingLink(!isEditingLink)}
                                    className="absolute right-3 p-1.5 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${copied
                                    ? "bg-emerald-500 text-white shadow-emerald-200"
                                    : "bg-slate-800 text-white shadow-slate-200 hover:bg-slate-900"
                                    }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                variant="outline"
                                className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                                onClick={() => {
                                    // Mock url shortening
                                    const shortId = Math.random().toString(36).substring(7);
                                    setDisplayUrl(`${window.location.origin}/s/${shortId}`);
                                    alert("Short URL generated (Local Mock)");
                                }}
                            >
                                <ExternalLink className="w-4 h-4" />
                                Generate Short URL
                            </Button>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center gap-8 shadow-inner">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[124px] min-h-[124px] flex items-center justify-center">
                            {(displayUrl || bookingUrl) ? (
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(displayUrl || bookingUrl || window.location.origin)}`}
                                    alt="QR Code"
                                    className="w-[100px] h-[100px]"
                                />
                            ) : (
                                <div className="w-[100px] h-[100px] bg-slate-100 animate-pulse rounded-lg" />
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                Share this QR code to open the booking page instantly on any device.
                            </p>
                            <button
                                onClick={handleDownloadQR}
                                className="inline-flex items-center gap-2 text-slate-700 font-bold text-sm hover:text-slate-900 transition-colors group"
                            >
                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                <span>Download QR</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-400 text-[10px] font-bold tracking-[0.1em] uppercase">Social Media</p>
                            <div className="h-px flex-1 bg-slate-100 ml-4"></div>
                        </div>
                        <div className="flex flex-wrap gap-4 justify-between">
                            {shareOptions.map((opt) => (
                                opt.url ? (
                                    <a
                                        key={opt.name}
                                        href={opt.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 group transition-all"
                                    >
                                        <div className={`${opt.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                                            <opt.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{opt.name}</span>
                                    </a>
                                ) : (
                                    <button
                                        key={opt.name}
                                        onClick={opt.onClick}
                                        className="flex flex-col items-center gap-2 group transition-all"
                                    >
                                        <div className={`${opt.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                                            <opt.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{opt.name}</span>
                                    </button>
                                )
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center border-b border-slate-100 mb-6 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-4 pb-3 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabShare"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center flex-col gap-4">
                            {activeTab === "Shorten" && (
                                <p className="text-center text-slate-500 text-sm italic">Need to connect a shortening service like Bitly or Rebrandly.</p>
                            )}
                            <button className="mx-auto px-12 py-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-white hover:border-slate-300 transition-all flex items-center gap-3 active:scale-95 group">
                                {activeTab === "shorten" && (
                                    <>
                                        <Share2 className="w-5 h-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
                                        <span>Create Branded Link</span>
                                    </>
                                )}
                                {activeTab === "one-time" && (
                                    <>
                                        <Smartphone className="w-5 h-5 text-rose-500" />
                                        <span>Generate Burner URL</span>
                                    </>
                                )}
                                {activeTab === "embed" && (
                                    <>
                                        <Code className="w-5 h-5 text-emerald-500" />
                                        <span>Get Inline Embed Code</span>
                                    </>
                                )}
                                {activeTab === "slots" && (
                                    <>
                                        <Calendar className="w-5 h-5 text-amber-500" />
                                        <span>Copy Best Times to Email</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
