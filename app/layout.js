export const metadata = {
  title: 'Kelvin Mensah',
  description: 'Kelvin Mensah (Kelv Studio), Auckland UI/UX and graphic designer: websites and apps, brand identities, logos, event flyers and social media design.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
