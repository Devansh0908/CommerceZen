export default function Footer() {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
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

// Added React import for useEffect and useState
import * as React from 'react';
