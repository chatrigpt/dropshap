import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Zap, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Store,
  Package,
  ChevronRight
} from 'lucide-react';
import { dataService } from '../lib/data';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';

export default function Landing() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    dataService.getProducts().then(setProducts);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter font-display">DROPSHAP</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <a href="#comment-ca-marche" className="hover:text-primary transition-colors">Comment ça marche</a>
            <a href="#avantages" className="hover:text-primary transition-colors">Avantages</a>
            <a href="#produits" className="hover:text-primary transition-colors">Produits</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Connexion</Link>
            <Link to="/signup" className="btn-primary px-6 py-2.5 rounded-full text-sm">S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0A0A0A] text-white text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl lg:text-5xl font-black font-display leading-[1.1] tracking-tighter mb-7">
              Connectez les meilleurs <span className="text-primary">Fournisseurs locaux</span> <br className="hidden lg:block" /> & leurs <span className="text-primary">Produits gagnants</span> <br className="hidden lg:block" /> directement à votre boutique en ligne
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              Arrêtez de lancer à l'aveugle. Suivez ce que les meilleurs font pour gagner.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(191,90,242,0.4)] transition-all hover:scale-105">
                Commencer maintenant gratuitement
              </Link>
              <a href="#produits" className="bg-white text-black px-8 py-4 rounded-2xl text-lg font-black flex items-center justify-center gap-2 hover:bg-gray-100 transition-all hover:scale-105">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Voir le catalogue produits
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-xs font-bold text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                100+ Fournisseurs locaux
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Mises à jour quotidiennes
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Produits testés et approuvés
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?u=${i + 20}`} 
                    className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] object-cover" 
                    alt="User" 
                  />
                ))}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-400">Approuvé par 30,000+ e-commerçants & équipes</p>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(191,90,242,0.15)] border-2 border-white/5">
                <img 
                  src="https://monadia-bucket.sfo3.digitaloceanspaces.com/Dropshipper%20dashboard%20overview%20with%20product%20stats.png" 
                  alt="Dropshap Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(191,90,242,0.05)_0%,transparent_70%)] -z-10"></div>
      </section>

      {/* Narrative Section - The Problem */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black font-display mb-8 leading-tight">
                Le e-commerce en Afrique est difficile. <span className="text-primary">Nous le rendons simple.</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                La plupart des e-commerçants échouent à cause de trois problèmes majeurs : le sourcing de produits de qualité, la gestion des stocks coûteux et les délais de livraison interminables.
              </p>
              <div className="space-y-6">
                {[
                  "Accès direct aux stocks locaux en temps réel",
                  "Zéro investissement initial en inventaire",
                  "Livraison rapide par les fournisseurs eux-mêmes",
                  "Marge bénéficiaire garantie sur toute l'Afrique"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-100 rounded-[3rem] p-12">
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-400 font-bold mb-2 uppercase">Avant Dropshap</p>
                    <p className="text-lg font-bold text-red-500">"J'ai perdu 500.000 FCFA en stock invendu qui dort dans mon salon."</p>
                  </div>
                  <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 translate-x-6">
                    <p className="text-sm text-white/60 font-bold mb-2 uppercase">Avec Dropshap</p>
                    <p className="text-lg font-bold text-white">"Je ne paie que ce que je vends. Mon capital est en sécurité et mon business tourne."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="comment-ca-marche" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black font-display mb-6">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600">Trois étapes simples pour lancer votre empire e-commerce depuis votre canapé.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Choisissez vos produits",
                desc: "Parcourez notre catalogue de produits alimentaires et de consommation courante déjà disponibles localement.",
                icon: <Package className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Importez & Vendez",
                desc: "Ajoutez les produits à votre boutique Shopify ou vendez directement sur les réseaux sociaux.",
                icon: <Store className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Encaissez vos profits",
                desc: "Le fournisseur livre le client, vous gardez la marge. Pas de stock, pas de stress logistique.",
                icon: <TrendingUp className="w-8 h-8" />
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-6 -left-6 text-8xl font-black text-gray-100 group-hover:text-primary/10 transition-colors z-0">
                  {item.step}
                </div>
                <div className="relative z-10 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="avantages" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black font-display mb-8 leading-tight">
                Pourquoi choisir Dropshap pour votre business ?
              </h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Trouvez des fournisseurs opérationnels",
                    desc: "Fini les galères de sourcing. Nous avons déjà sélectionné pour vous des fournisseurs locaux fiables avec du stock réel."
                  },
                  {
                    title: "Lancez-vous sans capital",
                    desc: "Le plus gros frein au e-commerce est le coût du stock. Avec Dropshap, ce frein disparaît totalement."
                  },
                  {
                    title: "Logistique maîtrisée",
                    desc: "Nos fournisseurs gèrent la préparation et l'expédition. Vous vous concentrez uniquement sur le marketing et la vente."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link to="/signup" className="btn-primary px-8 py-4 rounded-2xl inline-flex items-center gap-2 group">
                  Créer mon compte maintenant
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                  <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20">
                    <Users className="w-10 h-10 mb-6" />
                    <h4 className="text-xl font-bold mb-2">Fournisseurs Locaux</h4>
                    <p className="text-primary-foreground/80 text-sm">Accès direct aux stocks en Côte d'Ivoire.</p>
                  </div>
                  <div className="bg-gray-900 p-8 rounded-[2rem] text-white">
                    <ShieldCheck className="w-10 h-10 mb-6 text-primary" />
                    <h4 className="text-xl font-bold mb-2">Paiement Sécurisé</h4>
                    <p className="text-gray-400 text-sm">Transactions transparentes et sécurisées.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-100 p-8 rounded-[2rem]">
                    <Zap className="w-10 h-10 mb-6 text-primary" />
                    <h4 className="text-xl font-bold mb-2">Automatisation</h4>
                    <p className="text-gray-500 text-sm">Gestion des stocks et commandes en temps réel.</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-lg">
                    <ShoppingBag className="w-10 h-10 mb-6 text-primary" />
                    <h4 className="text-xl font-bold mb-2">Zéro Stock</h4>
                    <p className="text-gray-500 text-sm">Ne payez que ce que vous vendez réellement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="produits" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-black font-display mb-6">Produits Disponibles</h2>
              <p className="text-xl text-gray-600">Un aperçu des produits alimentaires que vous pouvez commencer à vendre dès aujourd'hui.</p>
            </div>
            <Link to="/signup" className="text-primary font-bold flex items-center gap-2 hover:underline">
              Voir tout le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((product) => (
              <div key={product.record_id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  {product.photo_produit || product.product_image_base64 ? (
                    <img 
                      src={product.photo_produit || product.product_image_base64} 
                      alt={product.product_name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{product.product_name}</h3>
                  <p className="text-gray-500 mb-6">{product.variant}</p>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Prix de vente</p>
                      <p className="text-xl font-black text-gray-900">{formatCurrency(product.label_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Votre Profit</p>
                      <p className="text-xl font-black text-green-600">+{formatCurrency(product.label_price - product.supplier_price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Argumentative Section */}
      <section className="py-24 bg-dark-bg text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-black font-display mb-8 leading-tight">
                Prêt à transformer votre <span className="text-primary">ambition</span> en réalité ?
              </h2>
              <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                Le e-commerce en Afrique n'a jamais été aussi accessible. Avec Dropshap, vous éliminez les barrières financières et logistiques qui freinent 90% des entrepreneurs.
              </p>
              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Pas de Stock</h4>
                  <p className="text-gray-500 text-sm">Évitez les invendus et les coûts de stockage élevés.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Livraison Locale</h4>
                  <p className="text-gray-500 text-sm">Des délais courts pour une satisfaction client maximale.</p>
                </div>
              </div>
              <Link to="/signup" className="btn-primary px-10 py-5 rounded-2xl text-lg inline-flex items-center gap-3">
                Ouvrir ma boutique maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gray-800 p-10 rounded-[2.9rem] border border-white/5 relative z-10">
                <blockquote className="text-2xl font-medium italic mb-8 leading-relaxed">
                  "Grâce à Dropshap, j'ai pu lancer mon activité de vente de produits alimentaires en ligne avec seulement 5000 FCFA pour ma connexion internet. Aujourd'hui, je traite plus de 10 commandes par jour."
                </blockquote>
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/100?u=9" className="w-14 h-14 rounded-full border-2 border-primary" alt="Testimonial" />
                  <div>
                    <p className="font-bold text-lg text-white">Jean-Marc Koffi</p>
                    <p className="text-primary text-sm font-bold">E-commerçant à Abidjan</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[100px] -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter font-display">DROPSHAP</span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                La plateforme n°1 de dropshipping local en Afrique. Nous aidons les entrepreneurs à bâtir des entreprises rentables sans stock.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Plateforme</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Catalogue</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Fournisseurs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 Dropshap. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
