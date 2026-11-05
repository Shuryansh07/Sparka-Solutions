import { Toaster as Sonner } from 'sonner';

function Toaster(props) {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: '!rounded-xl !border !border-white/10 !bg-night !text-white !shadow-2xl !font-sans',
          icon: '!text-spark',
          description: '!text-chrome',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
