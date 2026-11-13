import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductCard({ product, onAsk, disabled }) {
  return (
    <article className="grid gap-1.5 rounded-xl border bg-background p-3">
      <p className="text-[11px] font-medium tracking-wide text-primary uppercase">{product.category}</p>
      <h3 className="text-[14px] leading-snug font-semibold">{product.name}</h3>
      {product.brand && <p className="text-[12px] text-muted-foreground">{product.brand}</p>}
      {product.summary && <p className="text-[13px] leading-relaxed text-foreground/80">{product.summary}</p>}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-0.5 w-fit px-2"
        disabled={disabled}
        onClick={() => onAsk(`Tell me more about ${product.name} (${product.sku})`)}
      >
        <MessageSquare /> Ask about this
      </Button>
    </article>
  );
}
