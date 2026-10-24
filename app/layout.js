export const metadata = {
  title: 'Kelvin Mensah',
  description: 'Graphic design portfolio of Kelvin Mensah: church flyers, birthday flyers, social media posts and banners.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
