# LUMI GRID 🧩

**Mantık • Strateji • Hassasiyet**

LUMI GRID, modern ve şık arayüze sahip, zekanızı zorlayacak bir mantık bulmaca oyunudur. Sudoku ve Mayın Tarlası gibi oyunlardan esinlenen kuralları ile her seviyede farklı bir meydan okuma sunar.

![Lumi Grid Screenshot](https://via.placeholder.com/1200x600?text=LUMI+GRID+Preview)

## 🌟 Özellikler

- **Sonsuz Oynanış**: Tohum (seed) tabanlı algoritma ile üretilen 200+ benzersiz seviye.
- **İki Dil Desteği**: Türkçe (TR) ve İngilizce (EN).
- **Zorlayıcı Kurallar**:
  - Her satır, sütun ve renkli bölgede sadece bir küre olmalı.
  - Küreler birbirine (çapraz dahil) değemez.
  - Numaralı tarayıcılar etrafındaki küre sayısını gösterir.
- **Modern Tasarım**: Glassmorphism efektleri, akıcı animasyonlar ve şık renk paleti.
- **Yardımcı Araçlar**: Akıllı ipuçları ve hata denetimi.

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn

### Adımlar

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/esinemre1/LUMIGAME.git
   cd LUMIGAME
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda `http://localhost:5173` (veya terminalde belirtilen port) adresine gidin.

## 📱 APK Oluşturma (Android)

Bu proje Capacitor kullanılarak Android uygulamasına dönüştürülebilir.

1. **Projeyi derleyin:**
   ```bash
   npm run build
   ```

2. **Capacitor ile senkronize edin:**
   ```bash
   npx cap sync
   ```

3. **Android Studio'da açın:**
   ```bash
   npx cap open android
   ```

## 🛠️ Teknolojiler

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
