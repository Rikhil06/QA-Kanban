import SiteList from '@/components/cards/SitesCard';

export default async function Page() {
  return (
      <div className='max-w-11/12 mx-auto mt-12'>
        <SiteList />
      </div>
  );
}