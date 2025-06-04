
"use client"; // Add use client for hooks

import * as React from 'react'; // Moved import to the top

export default function Footer() {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    // This effect will only run on the client after hydration
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  return (
    <footer className="bg-card text-card-foreground py-8 border-t mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-body">&copy; {currentYear} CommerceZen. All rights reserved.</p>
        <p className="text-xs font-body mt-1 text-muted-foreground">
          Elegance in Every Click.
        </p>
      </div>
    </footer>
  );
}
