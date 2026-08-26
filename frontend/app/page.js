import LoginForm from "./LoginForm";
import AddLinkForm from "./AddLinkForm";

async function getLinks() {
  const res = await fetch('http://api:4000/links', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('failed to fetch links');
  }
  return res.json();
}

export default async function Home() {
  const links = await getLinks();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Linkboard</h1>

      <LoginForm />
      <AddLinkForm />

      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.id} className="border rounded-lg p-4 flex items-center gap-3">
            {link.favicon_url && (
              <img src={link.favicon_url} alt="" className="w-5 h-5" />
            )}
            <div>
              <a href={link.url} className="font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                {link.title || link.url}
              </a>
              <p className="text-sm text-zinc-500">{link.url}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}