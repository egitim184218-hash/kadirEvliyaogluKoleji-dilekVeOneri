"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";

// Mesaj Tipi Tanımlaması
interface Message {
  id: number;
  name: string;
  grade: string;
  type: "dilek" | "oneri" | "sikayet";
  text: string;
  date: string;
  isLiked: boolean;
}

export default function Home() {
  // --- State Yönetimi ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "dilek" as "dilek" | "oneri" | "sikayet",
    message: ""
  });

  // Identity State
  const [identityCategory, setIdentityCategory] = useState<"student" | "parent" | "teacher" | "citizen">("student");
  // Student Specific
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // --- Veri Yükleme ---
  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Veri hatası:", err));

    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Update Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Olay İşleyiciler ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateIdentityString = () => {
    if (identityCategory === 'student') {
      if (!selectedGrade || !selectedBranch) return "";
      return `${selectedGrade}-${selectedBranch} Sınıfı Öğrencisi`;
    }
    if (identityCategory === 'parent') return "Veli";
    if (identityCategory === 'teacher') return "Öğretmen";
    if (identityCategory === 'citizen') return "Vatandaş";
    return "";
  };

  const handleSubmit = async () => {
    if (!formData.message.trim()) return alert("Lütfen bir mesaj yazın.");

    // Validate Identity
    const gradeString = calculateIdentityString();
    if (!gradeString) {
      if (identityCategory === 'student') return alert("Lütfen sınıf ve şube seçiniz.");
      return alert("Lütfen kimlik bilginizi seçiniz.");
    }

    setIsSubmitting(true);

    const newMessage = {
      name: formData.name || "İsimsiz",
      grade: gradeString,
      type: formData.type,
      text: formData.message,
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      const savedMessage = await res.json();

      setMessages([savedMessage, ...messages]);
      setFormData({ name: "", type: "dilek", message: "" });
      // Reset Identity Selection defaults
      if (identityCategory === 'student') {
        setSelectedGrade("");
        setSelectedBranch("");
      }

      // Başarı Efektleri
      triggerConfetti();
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // --- Admin İşlemleri ---
  const handleLogin = () => {
    if (adminPassword === "1842") {
      setIsAuthenticated(true);
    } else {
      alert("Hatalı Şifre");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
    setMessages(messages.filter(m => m.id !== id));
  };

  // --- Render ---
  if (isAdminOpen) {
    return (
      <div className={`min-h-screen p-6 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} animate-fade-in`}>
        <div className="max-w-6xl mx-auto">
          <div className={`flex justify-between items-center mb-8 p-4 rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className="text-2xl font-bold text-[#c62828] flex items-center gap-2">
              <span className="text-3xl">🛡️</span> Yönetici Paneli
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setIsAdminOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                ← Geri Dön
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className={`max-w-md mx-auto p-10 rounded-2xl shadow-xl mt-20 border animate-slide-up ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
              <h3 className="text-xl font-bold mb-6 text-center text-[#c62828]">Şifre Doğrulama</h3>
              <div className="space-y-4">
                <input
                  type="password"
                  className={`w-full p-4 border rounded-xl outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-[#c62828]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#c62828]/20 focus:border-[#c62828]'}`}
                  placeholder="Yönetici Şifresi"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={handleLogin}
                  className="w-full py-4 bg-[#c62828] text-white font-bold rounded-xl hover:bg-[#b71c1c] transition-colors shadow-lg shadow-red-900/20"
                >
                  Giriş Yap
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-6 rounded-2xl shadow-sm border flex flex-col hover:shadow-md transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${msg.type === 'dilek' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      msg.type === 'oneri' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                      {msg.type}
                    </span>
                    <span className="text-xs font-medium opacity-60">{msg.date}</span>
                  </div>
                  <p className="mb-6 flex-grow whitespace-pre-wrap leading-relaxed text-sm opacity-90">{msg.text}</p>
                  <div className={`border-t pt-4 mt-auto flex justify-between items-center ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                    <div className="text-sm font-semibold flex flex-col">
                      <span>{msg.name}</span>
                      <span className="opacity-60 font-normal text-xs">{msg.grade}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>

      {/* Header */}
      <header className={`sticky top-0 z-30 shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center md:items-start justify-between">

          {/* Logo ve Başlık */}
          <div className="flex flex-col items-center md:items-start flex-grow text-center md:text-left">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white p-1 rounded-xl shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#c62828] tracking-tight leading-none">
                  Kadir Evliyaoğlu Koleji
                </h1>
                <p className={`font-semibold text-sm mt-1 border-b-2 border-red-500 inline-block pb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Software Engineer: Süleyman Buğra Lök & Kerem Utku TERCAN
                </p>
              </div>
            </div>
            <p className={`text-sm font-medium mt-1 opacity-70 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dilek, Öneri ve Şikayet Kutusu</p>
          </div>

          {/* Sağ Üst Kontroller */}
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full transition-all ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Koyu/Açık Mod"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Yönetici Girişi Butonu */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="bg-[#c62828] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#b71c1c] transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
            >
              <span>🛡️</span> Yönetici
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 flex items-start justify-center">
        <div className={`w-full max-w-2xl rounded-2xl shadow-xl border overflow-hidden animate-slide-up transition-colors duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>

          <div className="p-6 md:p-8 space-y-8">

            {/* 1. Kimlik Seçimi */}
            <div className="space-y-4">
              <h3 className="text-xs font-black opacity-50 uppercase tracking-widest">KİMLİK TÜRÜ</h3>

              {/* Ana Kategoriler */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'student', label: 'Öğrenci', icon: '🎓' },
                  { id: 'parent', label: 'Veli', icon: '👨‍👩‍👧‍👦' },
                  { id: 'teacher', label: 'Öğretmen', icon: '📚' },
                  { id: 'citizen', label: 'Vatandaş', icon: '🏛️' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setIdentityCategory(item.id as any)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${identityCategory === item.id
                      ? 'border-[#c62828] bg-red-500/10 text-[#c62828]'
                      : `border-transparent ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`
                      }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Öğrenci Detay Seçimi */}
              {identityCategory === 'student' && (
                <div className={`p-4 rounded-xl border animate-fade-in mt-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold opacity-70 ml-1">Sınıf</label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#c62828] transition-colors ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      >
                        <option value="">Seçiniz</option>
                        <optgroup label="İlkokul">
                          {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                        </optgroup>
                        <optgroup label="Ortaokul">
                          {[5, 6, 7, 8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold opacity-70 ml-1">Şube</label>
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D', 'E'].map(branch => (
                          <button
                            key={branch}
                            onClick={() => setSelectedBranch(branch)}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${selectedBranch === branch
                              ? 'bg-[#c62828] text-white border-[#c62828]'
                              : darkMode
                                ? 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                          >
                            {branch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Ad Soyad */}
            <div className="space-y-2">
              <label className="text-xs font-black opacity-50 uppercase tracking-widest">KİŞİSEL BİLGİLER</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c62828] outline-none placeholder:opacity-50 transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white'}`}
                placeholder="Adınız Soyadınız (İsteğe Bağlı)"
              />
            </div>

            {/* 3. Mesaj Türü */}
            <div className="space-y-2">
              <label className="text-xs font-black opacity-50 uppercase tracking-widest">MESAJ İÇERİĞİ</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dilek', label: 'Dilek', color: 'blue' },
                  { id: 'oneri', label: 'Öneri', color: 'emerald' },
                  { id: 'sikayet', label: 'Şikayet', color: 'orange' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({ ...formData, type: t.id as any })}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border ${formData.type === t.id
                      ? `bg-${t.color}-500/10 text-${t.color}-500 border-${t.color}-500/50 ring-1 ring-${t.color}-500/50`
                      : `border-transparent ${darkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c62828] outline-none placeholder:opacity-50 resize-none mt-3 transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white'}`}
                placeholder="Düşüncelerinizi buraya yazın..."
              ></textarea>
            </div>

            {/* Gönder Butonu */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#c62828] hover:bg-[#b71c1c] text-white font-bold text-lg rounded-xl shadow-xl shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`p-8 text-center border-t transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <p className={`font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>© {new Date().getFullYear()} Kadir Evliyaoğlu Koleji</p>
      </footer>

      {/* Başarı Modalı */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform animate-in zoom-in-95 duration-300 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Başarılı!</h3>
            <p className="opacity-80 mb-8">Mesajınız başarıyla iletildi.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`w-full py-3 font-bold rounded-xl transition-colors ${darkMode ? 'bg-white text-slate-900 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
