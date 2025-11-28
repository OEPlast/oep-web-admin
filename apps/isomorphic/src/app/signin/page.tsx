import SignInForm from '@/app/signin/sign-in-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import Image from 'next/image';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/auth-options';

export const metadata = {
  ...metaObject('Sign In'),
};

export default async function SignIn() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/');
  }
  return (
    <AuthWrapperOne
      title={
        <>
          Welcome back! Please{' '}
          <span className="relative inline-block">
            Sign in to
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue md:w-28 xl:-bottom-1.5 xl:w-36" />
          </span>{' '}
          continue.
        </>
      }
      description="Welcome to Rawura Admin."
      bannerTitle="Sign in to access your admin account."
      bannerDescription="Have fun managing the best store in the world! 😉."
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={
              'https://isomorphic-furyroad.s3.amazonaws.com/public/auth/sign-up.webp'
            }
            alt="Sign Up Thumbnail"
            fill
            priority
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
      }
      showBackButton={false}
    >
      <SignInForm />
    </AuthWrapperOne>
  );
}
