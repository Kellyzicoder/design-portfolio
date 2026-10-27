export const metadata = {
  title: 'Kelvin Mensah',
  description: 'Kelvin Mensah (Kelv Studio), Auckland graphic designer: logos, brand identities, event flyers, banners and social media design.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
