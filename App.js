import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ShoppingBag, Search, User, Plus, 
  Trash2, Bell, MapPin, Sparkles, Shield, 
  X, LogOut, Camera, Palette, ChevronDown,
  Menu, ArrowUp, ChevronRight, ChevronLeft, Eye, MessageSquare,
  Coffee, Heart, Shirt, Image as ImageIcon, Send, GraduationCap,
  Clock, AlertTriangle, Zap, Smile, Frown, Meh
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';

// --- 0. 全局样式 (去水印 + 优化) ---
const GlobalStyles = () => (
  <style>{`
    #__next-build-watcher, #root > div > a[href^="https://codesandbox.io"], iframe[style*="position: fixed"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    * { -ms-overflow-style: none; scrollbar-width: none; }
    img { -webkit-user-drag: none; user-drag: none; }
  `}</style>
);

// --- 1. 本地数据库引擎 ---
const useLocalDB = (key, expireDays = null) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        let parsed = JSON.parse(raw);
        if (expireDays) {
          const now = Date.now();
          const valid = parsed.filter(i => !i.timestamp || (now - i.timestamp)/(86400000) <= expireDays);
          if (valid.length !== parsed.length) window.localStorage.setItem(key, JSON.stringify(valid));
          setData(valid);
        } else setData(parsed);
      }
    } catch (e) {}
  }, [key, expireDays]);

  useEffect(() => {
    const handler = (e) => { if (e.key === key) setData(JSON.parse(e.newValue||'[]')); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const save = (d) => { setData(d); window.localStorage.setItem(key, JSON.stringify(d)); };
  return {
    data,
    addItem: (i) => save([{...i, id: Date.now(), timestamp: Date.now(), comments: []}, ...data]),
    deleteItem: (id) => save(data.filter(i => i.id !== id)),
    updateItem: (id, u) => save(data.map(i => i.id === id ? {...i, ...u} : i))
  };
};

// --- 2. DCU 官方背景 ---
const LiveBackground = () => (
  <div className="fixed inset-0 z-[-1] bg-[#00205B] overflow-hidden">
    <div className="absolute top-[-30%] left-[-20%] w-[90vw] h-[90vw] bg-[#003580]/60 rounded-full blur-[120px] animate-pulse"/>
    <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-[#001540]/80 rounded-full blur-[100px]"/>
    <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] bg-[#FF7E00]/10 rounded-full blur-[150px] animate-pulse delay-1000"/>
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
  </div>
);

// --- 3. 真·Di-Coo 吉祥物组件 (SVG V8.0 - 嘴巴完美复刻) ---
const DiCooSVG = ({ config, moodOverride = null }) => {
  const { color, accessory, mood: savedMood } = config;
  const currentMood = moodOverride || savedMood || 'happy';

  // 1. 头部与毛发
  const Head = () => (
    <g>
      {/* 头顶呆毛 */}
      <path 
        d="M 52 15 Q 50 5 58 8 Q 60 10 62 15 Q 68 5 72 10 Q 74 12 66 18" 
        fill={color} 
        stroke="none"
      />
      {/* 身体 */}
      <ellipse cx="60" cy="65" rx="48" ry="46" fill={color} />
    </g>
  );

  // 2. 五官组件
  const Face = () => {
    const eyeColor = "#1a1a1a";
    
    // 眼睛
    const Eyes = () => {
      if (currentMood === 'joy') return (
        <g fill="none" stroke={eyeColor} strokeWidth="3" strokeLinecap="round">
          <path d="M 38 60 Q 45 55 52 60" />
          <path d="M 68 60 Q 75 55 82 60" />
        </g>
      );
      
      // 默认/开心
      return (
        <g>
          {/* 眉毛 (黑色小拱门) */}
          <path d="M 38 50 Q 42 46 46 50" fill="none" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 74 50 Q 78 46 82 50" fill="none" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          
          {/* 眼睛 (黑色实心圆 + 左上高光) */}
          <circle cx="42" cy="60" r="6" fill={eyeColor} />
          <circle cx="40" cy="58" r="2.5" fill="white" />
          
          <circle cx="78" cy="60" r="6" fill={eyeColor} />
          <circle cx="76" cy="58" r="2.5" fill="white" />
        </g>
      );
    };

    // 嘴巴逻辑 (终极修正：M型上唇 + 宽大下唇 + 露舌头)
    const Mouth = () => {
      return (
        <g transform="translate(0, 5)">
          {/* 1. 嘴巴外轮廓 (蜜桃橘色) */}
          <path 
            d="M 38 68 
               C 38 68, 45 62, 60 62 
               C 75 62, 82 68, 82 68 
               C 82 68, 88 85, 80 98 
               C 72 108, 48 108, 40 98 
               C 32 85, 38 68, 38 68 Z"
            fill="#FFAD76" 
          />
          
          {/* 2. 嘴巴开口 (黑色区域) */}
          <path 
            d="M 42 72 
               Q 60 76 78 72 
               Q 60 90 42 72 Z" 
            fill="#1a1a1a" 
          />
          
          {/* 3. 小舌头 (粉红色) */}
          <path 
             d="M 50 80 Q 60 86 70 80" 
             fill="#FF6B6B" 
             stroke="none"
          />
          
          {/* 4. 上嘴唇线 (深色描边) */}
          <path 
            d="M 42 72 Q 50 68 60 70 Q 70 68 78 72" 
            fill="none" 
            stroke="#1a1a1a" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </g>
      );
    };

    return (
      <>
        <Eyes />
        {/* 腮红 */}
        <defs><filter id="blush"><feGaussianBlur in="SourceGraphic" stdDeviation="4" /></filter></defs>
        <circle cx="25" cy="68" r="8" fill="#ff9999" fillOpacity="0.4" filter="url(#blush)" />
        <circle cx="95" cy="68" r="8" fill="#ff9999" fillOpacity="0.4" filter="url(#blush)" />
        <Mouth />
      </>
    );
  };

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl overflow-visible">
      <Head />
      <Face />

      {/* 4. 配饰层 */}
      {accessory === 'grad' && (
          <g transform="translate(0, -18) scale(1.1) rotate(-5, 60, 60)">
            <path d="M30 35 L60 22 L90 35 L60 48 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="1"/>
            <path d="M40 45 Q60 52 80 45" fill="none" stroke="#2c3e50" strokeWidth="0"/> 
            <line x1="90" y1="35" x2="90" y2="65" stroke="#FFB81C" strokeWidth="2"/>
            <circle cx="90" cy="65" r="3" fill="#FFB81C"/>
          </g>
      )}
      {accessory === 'glasses' && (
        <g transform="translate(0, 2)">
          <circle cx="42" cy="60" r="11" fill="none" stroke="#1a1a1a" strokeWidth="2"/>
          <circle cx="78" cy="60" r="11" fill="none" stroke="#1a1a1a" strokeWidth="2"/>
          <line x1="53" y1="60" x2="67" y2="60" stroke="#1a1a1a" strokeWidth="2"/>
        </g>
      )}
      {accessory === 'crown' && (
          <path d="M35 20 L45 40 L60 10 L75 40 L85 20 L85 40 L35 40 Z" fill="#FFB81C" stroke="#f39c12" strokeWidth="2" transform="translate(0, -25)" />
      )}
      {accessory === 'headphone' && (
          <g transform="translate(0, 5)">
            <path d="M12 60 Q12 5 60 5 Q108 5 108 60" fill="none" stroke="#FF4500" strokeWidth="5" strokeLinecap="round"/>
            <rect x="2" y="50" width="14" height="26" rx="6" fill="#b91c1c"/>
            <rect x="104" y="50" width="14" height="26" rx="6" fill="#b91c1c"/>
          </g>
      )}
    </svg>
  );
};

// --- 4. 桌面宠物 (情感互动) ---
const PetDiCoo = ({ config, onClick }) => {
  const [tempMood, setTempMood] = useState(null);
  const [bubble, setBubble] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [variant, setVariant] = useState('idle');
  const currentMood = config.mood || 'happy';

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        if (currentMood === 'joy') setVariant('bounce');
        else if (currentMood === 'sad') setVariant('slow_sway');
        else setVariant('shake');
        setTimeout(() => setVariant('idle'), 2000);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentMood]);

  const handleTap = () => {
    const reactions = ['love', 'shock', 'joy'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    setTempMood(reaction);
    const msgs = ['❤️', '⚡️', '🎵', '👋', '👀'];
    setBubble(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => { setTempMood(null); setBubble(null); }, 1500);
    onClick(); 
  };

  const variants = {
    idle: { y: [0, -5, 0], rotate: 0, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    bounce: { y: [0, -30, 0], scale: [1, 1.1, 0.9, 1], transition: { duration: 0.5 } },
    shake: { rotate: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } },
    slow_sway: { rotate: [-2, 2, -2], transition: { duration: 4, repeat: Infinity } }
  };

  return (
    <motion.div
      className="fixed bottom-8 left-6 z-50 cursor-pointer"
      style={{ x, y }}
      drag dragElastic={0.1} dragConstraints={{ left: 0, right: 200, top: -400, bottom: 0 }}
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
      onClick={handleTap}
      animate={variant}
    >
      <div className="w-32 h-32 relative filter drop-shadow-2xl">
        <DiCooSVG config={config} moodOverride={tempMood} />
        <AnimatePresence>
          {bubble && (
            <motion.div 
              initial={{ opacity: 0, scale: 0, y: 10 }} animate={{ opacity: 1, scale: 1, y: -20 }} exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-[#00205B] px-3 py-1 rounded-full text-lg shadow-lg border-2 border-[#FF7E00]"
            >
              {bubble}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- 5. UI 组件 ---
const GlassCard = ({ children, className = "", onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onClick={onClick}
    className={`backdrop-blur-xl bg-white/10 border border-white/10 shadow-lg rounded-3xl overflow-hidden hover:bg-white/20 hover:border-[#FF7E00]/30 transition-all duration-300 cursor-pointer ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ title, icon: Icon, color, onAdd, btnText = "发布" }) => (
  <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
    <div><h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white drop-shadow-lg"><div className={`p-2 rounded-xl bg-white/5 ${color.replace('text-', 'text-')}`}><Icon size={24} /></div>{title}</h2></div>
    {onAdd && (<button onClick={onAdd} className={`px-5 py-2 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-lg active:scale-95 bg-[#FF7E00] text-white`}><Plus size={18} strokeWidth={3}/> {btnText}</button>)}
  </div>
);

const MultiImageUpload = ({ images, onChange }) => {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => { onChange(prev => [...prev, reader.result]); };
        reader.readAsDataURL(file);
      });
    }
  };
  return (
    <div className="space-y-3">
      <div onClick={() => fileRef.current.click()} className="w-full h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF7E00] hover:bg-[#FF7E00]/10 transition-all group bg-black/20">
        <Camera size={28} className="text-white/50 group-hover:text-[#FF7E00] mb-2"/>
        <span className="text-xs text-white/40">点击上传图片 (支持多选)</span>
        <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" multiple className="hidden" />
      </div>
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <div key={idx} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10 relative">
               <img src={img} className="w-full h-full object-cover" alt="thumb"/>
               <button onClick={() => onChange(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"><X size={10}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DetailModal = ({ item, onClose, onAddComment, type }) => {
  const [comment, setComment] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  const images = item.images || (item.image ? [item.image] : []);
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#00205B] w-full max-w-2xl h-[85vh] rounded-3xl border border-white/20 flex flex-col overflow-hidden relative shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold bg-[#FF7E00] text-white px-2 py-1 rounded uppercase">{type}</span>
             <span className="text-xs text-white/50">{new Date(item.timestamp || Date.now()).toLocaleDateString()}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          {images.length > 0 && (
            <div className="relative h-64 md:h-80 bg-black">
              <img src={images[currentImg]} className="w-full h-full object-contain" alt="detail"/>
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImg(c => (c > 0 ? c - 1 : images.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"><ChevronLeft/></button>
                  <button onClick={() => setCurrentImg(c => (c < images.length - 1 ? c + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"><ChevronRight/></button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, idx) => (<div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImg ? 'bg-[#FF7E00]' : 'bg-white/30'}`}/>))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">{item.title || item.content}</h2>
            {item.price && <div className="text-2xl text-[#FF7E00] font-bold">₩{item.price}</div>}
            {item.reward && <div className="inline-flex items-center gap-1 text-[#FF7E00] bg-[#FF7E00]/10 px-3 py-1 rounded-full border border-[#FF7E00]/30"><Sparkles size={16}/> 赏金急寻</div>}
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{item.desc || item.content}</p>
            {item.contact && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-white/40 mb-1">联系方式</p>
                <p className="text-lg font-mono text-blue-200 select-all">{item.contact}</p>
              </div>
            )}
            <div className="pt-8 border-t border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18}/> 留言互动</h3>
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {(item.comments || []).length === 0 ? <p className="text-white/30 text-sm italic">暂无留言...</p> : item.comments.map((c, i) => (
                     <div key={i} className="bg-white/5 p-3 rounded-lg">
                       <div className="flex justify-between text-xs text-white/40 mb-1"><span>{c.author}</span><span>{c.time}</span></div>
                       <p className="text-sm">{c.text}</p>
                     </div>
                   ))}
              </div>
              <div className="flex gap-2">
                <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="友善交流..." className="flex-1 bg-black/30 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-[#FF7E00] text-white"/>
                <button onClick={() => { if(comment.trim()) { onAddComment(item.id, comment); setComment(''); } }} className="bg-[#FF7E00] text-white p-2 rounded-full"><Send size={18}/></button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 6. 主程序 ---
export default function DCUConnect() {
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  
  const { data: marketItems, addItem: addMarket, deleteItem: deleteMarket, updateItem: updateMarket } = useLocalDB('dcu_market_v25', 60); 
  const { data: lostItems, addItem: addLost, deleteItem: deleteLost, updateItem: updateLost } = useLocalDB('dcu_lost_v25', 30);
  const { data: notices, addItem: addNotice, deleteItem: deleteNotice, updateItem: updateNotice } = useLocalDB('dcu_notices_v25');
  const { data: chats, addItem: addChat, deleteItem: deleteChat, updateItem: updateChat } = useLocalDB('dcu_chats_v25', 7);

  const [diCoo, setDiCoo] = useState(() => {
    const saved = window.localStorage.getItem('dcu_mascot_v25');
    return saved ? JSON.parse(saved) : { color: '#ffffff', accessory: 'grad', mood: 'happy' };
  });
  useEffect(() => window.localStorage.setItem('dcu_mascot_v25', JSON.stringify(diCoo)), [diCoo]);

  const [role, setRole] = useState('visitor'); 
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ open: false, type: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [formData, setFormData] = useState({ title: '', price: '', desc: '', contact: '', images: [], reward: false, content: '' });
  const [logoTaps, setLogoTaps] = useState(0);

  const handleSecret = () => {
    if(role !== 'visitor') return;
    setLogoTaps(p => p + 1);
    if(logoTaps + 1 === 5) { setShowLogin(true); setLogoTaps(0); }
  };
  const verifyAdmin = () => {
    if(password === 'dcu2025') { setRole('admin'); setShowLogin(false); alert("👑 管理员模式 (Level 1)"); } 
    else if(password === 'teacher666') { setRole('teacher'); setShowLogin(false); alert("🎓 教师模式 (Level 2)"); }
    else if(password === 'ta888') { setRole('ta'); setShowLogin(false); alert("📝 助教模式 (Level 3)"); }
    else { alert("密码错误"); }
  };

  const canPostNotice = role === 'admin' || role === 'teacher'; 
  const canDeleteAny = role === 'admin'; 
  const canDeleteChat = role === 'admin' || role === 'ta'; 

  const handleAddComment = (itemId, text) => {
    const authorMap = { admin: 'DCU官方', teacher: 'DCU老师', ta: '课程助教', visitor: '同学' };
    const newComment = { author: authorMap[role], text, time: new Date().toLocaleString() };
    
    let type = 'notice';
    if (notices.find(i => i.id === itemId)) type = 'notice';
    else if (marketItems.find(i => i.id === itemId)) type = 'market';
    else if (lostItems.find(i => i.id === itemId)) type = 'lost';
    else if (chats.find(i => i.id === itemId)) type = 'chat';

    const updater = type === 'notice' ? updateNotice : type === 'market' ? updateMarket : type === 'lost' ? updateLost : updateChat;
    const list = type === 'notice' ? notices : type === 'market' ? marketItems : type === 'lost' ? lostItems : chats;
    
    const currentItem = list.find(i => i.id === itemId);
    if(currentItem) {
        updater(itemId, { comments: [...(currentItem.comments || []), newComment] });
        setSelectedItem({ ...currentItem, comments: [...(currentItem.comments || []), newComment] });
    }
  };

  const publish = () => {
    const item = { ...formData };
    if(modal.type === 'market') { if(!formData.title) return alert("请输入标题"); addMarket(item); }
    if(modal.type === 'lost') { if(!formData.title) return alert("请输入标题"); addLost(item); }
    if(modal.type === 'notice') { if(!formData.title) return alert("请输入标题"); addNotice(item); }
    if(modal.type === 'chat') { 
        if(!formData.content) return alert("请输入内容"); 
        const colors = ['bg-pink-500/30 border-pink-500/20', 'bg-blue-500/30 border-blue-500/20', 'bg-green-500/30 border-green-500/20'];
        const newItem = { ...formData, color: colors[Math.floor(Math.random() * colors.length)], likes: 0, author: '匿名同学' };
        addChat(newItem); 
    }
    setModal({ open: false, type: '' });
    setFormData({ title: '', price: '', desc: '', contact: '', images: [], reward: false, content: '' });
  };

  const handleDelete = (deleteFn, id, e) => {
    e.stopPropagation();
    if(window.confirm("确认删除？")) deleteFn(id);
  };

  // 打字机特效标题
  const TypewriterTitle = ({ text, onClick }) => {
    const letters = Array.from(text);
    const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
    const child = { visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } }, hidden: { opacity: 0, y: 20, transition: { type: "spring", damping: 12, stiffness: 200 } } };
    return (
      <motion.h1 style={{ display: "flex", overflow: "hidden", justifyContent: "center" }} variants={container} initial="hidden" animate="visible" className="text-6xl md:text-8xl font-black tracking-tighter mb-2 drop-shadow-2xl cursor-pointer select-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60" onClick={onClick}>
        {letters.map((letter, index) => (<motion.span variants={child} key={index}>{letter === " " ? "\u00A0" : letter}</motion.span>))}
      </motion.h1>
    );
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#FF7E00]/30 overflow-x-hidden relative pb-safe">
      <GlobalStyles />
      <LiveBackground />
      <PetDiCoo config={diCoo} onClick={() => setShowWardrobe(true)} />

      {/* Top Nav */}
      <motion.nav style={{ opacity: headerOpacity }} className="fixed top-0 left-0 right-0 z-40 bg-[#00205B]/80 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center shadow-lg">
        <span className="font-bold text-lg tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 bg-[#FF7E00] rounded-full animate-pulse"></div> DCU
        </span>
        {role !== 'visitor' && (
          <button onClick={() => {if(window.confirm('退出管理?')) setRole('visitor')}} className={`text-[10px] font-bold px-2 py-1 rounded-full ${role === 'admin' ? 'bg-[#FF7E00] text-white' : 'bg-blue-400 text-black'}`}>
            {role === 'admin' ? '👑 ADMIN' : role === 'teacher' ? '🎓 TEACHER' : '📝 TA'}
          </button>
        )}
      </motion.nav>

      {/* Hero */}
      <header className="relative min-h-[65vh] flex flex-col items-center justify-center text-center px-6 pt-16">
        <TypewriterTitle text="DCU Connect" onClick={handleSecret} />
        <motion.div initial={{ w: 0 }} animate={{ w: '100%' }} className="h-1 w-24 bg-[#FF7E00] rounded-full mb-6"/>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} delay={0.2} className="text-blue-100/80 text-lg mb-8 font-medium">大邱加图立大学<br/>中国留学生高端社区</motion.p>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} delay={0.4} className="flex flex-wrap justify-center gap-4">
           <button onClick={() => document.getElementById('market').scrollIntoView({behavior: 'smooth'})} className="bg-white text-[#00205B] px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">逛集市</button>
           <button onClick={() => document.getElementById('lost').scrollIntoView({behavior: 'smooth'})} className="bg-[#00205B]/50 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-colors shadow-lg">失物招领</button>
           <button onClick={() => document.getElementById('chat').scrollIntoView({behavior: 'smooth'})} className="bg-[#FF7E00] text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-2"><Coffee size={18}/> 茶话会</button>
        </motion.div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-40 space-y-24">
        {/* Notice */}
        <section id="notice">
          <SectionHeader title="校务通知" icon={Bell} color="text-blue-300" onAdd={canPostNotice ? () => setModal({open:true, type:'notice'}) : null} btnText="发布通知" />
          <div className="space-y-4">
            {notices.length === 0 && <p className="text-white/30 text-center italic">暂无通知</p>}
            {notices.map(n => (
              <GlassCard key={n.id} onClick={() => setSelectedItem({...n, type: 'notice'})} className="p-6 flex gap-4 items-start bg-gradient-to-r from-[#00205B]/60 to-transparent border-[#00205B]">
                <div className="w-1 h-full bg-[#FF7E00] rounded-full"/>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{n.title}</h3>
                  {(n.images && n.images.length > 0) && <img src={n.images[0]} className="w-full h-32 object-cover rounded-xl mb-3" alt="notice"/>}
                  <p className="text-blue-100/80 leading-relaxed text-sm line-clamp-2">{n.content}</p>
                </div>
                {canDeleteAny && <button onClick={(e) => handleDelete(deleteNotice, n.id, e)} className="text-red-400"><Trash2/></button>}
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Market */}
        <section id="market">
          <SectionHeader title="二手集市" icon={ShoppingBag} color="text-purple-300" onAdd={() => setModal({open:true, type:'market'})} btnText="卖闲置" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketItems.length === 0 && <p className="col-span-2 text-white/30 text-center italic">暂无商品</p>}
            {marketItems.map(item => (
              <GlassCard key={item.id} onClick={() => setSelectedItem({...item, type: 'market'})} className="p-0 group grid grid-cols-3 h-36">
                <div className="col-span-1 bg-black/30 relative overflow-hidden h-full border-r border-white/10">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} className="w-full h-full object-cover" alt={item.title}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-white/20">📦</div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-[#00205B] px-2 py-0.5 rounded text-[10px] font-bold text-[#FF7E00]">₩{item.price}</div>
                </div>
                <div className="col-span-2 p-4 flex flex-col justify-between">
                  <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs text-white/40">{item.contact}</span>
                    {canDeleteAny && <button onClick={(e) => handleDelete(deleteMarket, item.id, e)} className="text-red-400"><Trash2 size={14}/></button>}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Lost */}
        <section id="lost">
          <SectionHeader title="失物招领" icon={Search} color="text-green-300" onAdd={() => setModal({open:true, type:'lost'})} btnText="发布信息" />
          <div className="space-y-4">
            {lostItems.length === 0 && <p className="text-white/30 text-center italic">暂无失物信息</p>}
            {lostItems.map(item => (
              <GlassCard key={item.id} onClick={() => setSelectedItem({...item, type: 'lost'})} className={`p-5 relative overflow-hidden ${item.reward ? 'border-[#FF7E00]/50 bg-[#FF7E00]/5' : ''}`}>
                {item.reward && <div className="absolute top-0 right-0 bg-[#FF7E00] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1"><Sparkles size={10}/> 赏金</div>}
                <div className="flex gap-4 items-start">
                   <div className="w-16 h-16 rounded-xl bg-black/20 shrink-0 overflow-hidden border border-white/10">
                      {(item.images && item.images.length > 0) ? <img src={item.images[0]} className="w-full h-full object-cover" alt="lost"/> : <div className="w-full h-full flex items-center justify-center text-white/20"><MapPin size={20}/></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">{item.title}</h3>
                      <p className="text-white/60 text-xs mt-1">📍 {item.location}</p>
                   </div>
                   {canDeleteAny && <button onClick={(e) => handleDelete(deleteLost, item.id, e)} className="text-red-400 self-center"><Trash2 size={16}/></button>}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Chat */}
        <section id="chat">
          <SectionHeader title="自由茶话会" icon={Coffee} color="text-pink-300" onAdd={() => setModal({open:true, type:'chat'})} btnText="吐槽 / 捞人" />
          <div className="grid grid-cols-2 gap-4">
             {chats.length === 0 && <p className="col-span-2 text-white/30 text-center italic">快来发布第一条吐槽吧！</p>}
             {chats.map(chat => (
               <GlassCard key={chat.id} onClick={() => setSelectedItem({...chat, type: 'chat'})} className={`p-4 flex flex-col justify-between min-h-[140px] border-0 ${chat.color} relative hover:scale-[1.02] transition-transform`}>
                  <p className="font-bold text-sm leading-relaxed mb-4 text-white drop-shadow-md line-clamp-3">"{chat.content}"</p>
                  <div className="flex justify-between items-center text-xs text-white/80">
                    <span>{chat.author}</span>
                    <div className="flex items-center gap-1"><Heart size={12} fill="white" className="text-white"/> {chat.likes}</div>
                  </div>
                  {canDeleteChat && <button onClick={(e) => handleDelete(deleteChat, chat.id, e)} className="absolute top-2 right-2 text-white/50 hover:text-red-500"><Trash2 size={14}/></button>}
               </GlassCard>
             ))}
          </div>
        </section>
      </div>

      <footer className="text-center py-10 text-white/30 text-xs border-t border-white/5 mt-20"><p>&copy; 2025 DCU Connect.</p></footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedItem && <DetailModal item={selectedItem} type={selectedItem.type} onClose={() => setSelectedItem(null)} onAddComment={handleAddComment} />}
        {showWardrobe && (
           <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div initial={{y: 100, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 100, opacity: 0}} className="bg-[#00205B] w-full max-w-md rounded-3xl p-6 border border-white/20 shadow-2xl relative">
               <button onClick={() => setShowWardrobe(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X/></button>
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Shirt size={20}/> 鹈鹕衣橱</h3>
               
               <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                 <div><label className="text-xs text-white/40 mb-3 block flex items-center gap-2"><Palette size={14}/> 肤色</label>
                   <div className="flex gap-3 items-center flex-wrap">
                     <input type="color" value={diCoo.color} onChange={(e) => setDiCoo({...diCoo, color: e.target.value})} className="w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer"/>
                     {['#ffffff', '#fff1e6', '#fcd5ce', '#dbe7e4', '#333333'].map(c => (<button key={c} onClick={() => setDiCoo({...diCoo, color: c})} className="w-8 h-8 rounded-full border border-white/20" style={{backgroundColor: c}} />))}
                   </div>
                 </div>
                 <div><label className="text-xs text-white/40 mb-3 block flex items-center gap-2"><Smile size={14}/> 表情</label>
                   <div className="grid grid-cols-4 gap-3">
                     {[{id: 'happy', label: '😊 开心'}, {id: 'joy', label: '😆 快乐'}, {id: 'sad', label: '😭 难过'}, {id: 'shock', label: '😲 惊讶'}].map(m => (
                       <button key={m.id} onClick={() => setDiCoo({...diCoo, mood: m.id})} className={`py-2 rounded-xl text-xs transition-all ${diCoo.mood === m.id ? 'bg-[#FF7E00] text-white font-bold shadow-lg' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>{m.label}</button>
                     ))}
                   </div>
                 </div>
                 <div><label className="text-xs text-white/40 mb-3 block flex items-center gap-2"><Sparkles size={14}/> 配饰</label>
                   <div className="grid grid-cols-5 gap-3">{[{id: 'none', label: '无'}, {id: 'grad', label: '学士'}, {id: 'glasses', label: '眼镜'}, {id: 'crown', label: '皇冠'}, {id: 'headphone', label: '耳机'}].map(acc => (<button key={acc.id} onClick={() => setDiCoo({...diCoo, accessory: acc.id})} className={`aspect-square rounded-xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-[10px] gap-1 transition-all ${diCoo.accessory === acc.id ? 'bg-[#00205B] border border-[#FF7E00] text-[#FF7E00]' : 'text-white/50 border border-white/10'}`}>{acc.label}</button>))}</div>
                 </div>
               </div>
             </motion.div>
           </div>
        )}
        {modal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-[#00205B] border border-white/20 w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">{modal.type === 'chat' ? '发起讨论' : '发布信息'}</h3><button onClick={() => setModal({open: false, type: ''})}><X className="text-white/50 hover:text-white"/></button></div>
              <div className="space-y-4">
                {modal.type === 'chat' ? (
                  <>
                    <textarea placeholder="发条友善的评论..." rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:border-[#FF7E00] text-white"/>
                    <p className="text-xs text-white/40 text-center">内容完全匿名，请文明发言。</p>
                  </>
                ) : (
                  <>
                    <MultiImageUpload images={formData.images} onChange={(imgs) => setFormData({...formData, images: imgs})} />
                    <input placeholder="标题" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:border-[#FF7E00] text-white"/>
                    {modal.type === 'market' && <input placeholder="价格 (₩)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:border-[#FF7E00] text-white"/>}
                    <textarea placeholder="描述..." rows={3} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:border-[#FF7E00] text-white"/>
                    {modal.type !== 'notice' && <input placeholder="联系方式" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:border-[#FF7E00] text-white"/>}
                    {modal.type === 'lost' && <div onClick={() => setFormData({...formData, reward: !formData.reward})} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 ${formData.reward ? 'border-[#FF7E00] bg-[#FF7E00]/10 text-[#FF7E00]' : 'border-white/10 text-white/50'}`}><Sparkles size={20}/> 赏金急寻</div>}
                  </>
                )}
                <button onClick={publish} className="w-full bg-white text-[#00205B] hover:bg-gray-200 py-3 rounded-xl font-bold mt-2 transition-colors shadow-lg">立即发布</button>
              </div>
            </motion.div>
          </div>
        )}
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <motion.div initial={{y: 20, opacity:0}} animate={{y: 0, opacity:1}} className="text-center w-full max-w-sm">
              <Shield size={48} className="mx-auto text-[#FF7E00] mb-6"/>
              <input type="password" placeholder="输入身份校验码" autoFocus value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent border-b-2 border-white/20 text-center text-3xl py-4 mb-8 outline-none focus:border-[#FF7E00] text-white font-mono tracking-widest"/>
              <button onClick={verifyAdmin} className="bg-[#FF7E00] text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">确认身份</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
