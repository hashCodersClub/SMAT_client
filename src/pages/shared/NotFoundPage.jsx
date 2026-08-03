import { FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Not Found Page
|--------------------------------------------------------------------------
|
| Rendered for any URL that doesn't match a known route. Without this,
| an unmatched path (typo'd URL, stale bookmark, bad deep link) renders
| a blank white screen with no way back.
|--------------------------------------------------------------------------
*/

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FiAlertTriangle size={28} />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        Page not found
      </h1>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Go back
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Go to login
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
