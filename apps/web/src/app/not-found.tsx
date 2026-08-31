import Link from 'next/link';
import { Button } from '@guppy-kit/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="text-8xl">🔧</div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground max-w-sm">
        This page doesn't exist. It might have been moved or deleted.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
