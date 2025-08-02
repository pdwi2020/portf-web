import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { marked } from "marked";
import React from "react";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const project = state || null;

  // initialise readmeHtml if embedded
  const [readmeHtml, setReadmeHtml] = React.useState(
    project?.readme ? marked.parse(project.readme) : null
  );
  const [readmeError, setReadmeError] = React.useState(null);
  // Fetch README.md if not embedded and github link present
  React.useEffect(() => {
    const fetchReadme = async () => {
      if (!project?.github) return;
      const repoPath = project.github.replace("https://github.com/", "");
      const tryBranches = ["main", "master"];
      for (const branch of tryBranches) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/README.md`;
          const res = await fetch(rawUrl);
          if (res.ok) {
            const md = await res.text();
            // Convert markdown to HTML using marked
            // convert relative image paths to absolute URLs
            const baseUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/`;
            const fixedMd = md.replace(/\]\((?!http)(.*?)\)/g, (_match, p1) => `](${baseUrl}${p1})`);
            const html = marked.parse(fixedMd);
            setReadmeHtml(html);
            return;
          }
        } catch (err) {
          // continue to next branch
        }
      }
      setReadmeError("README not found");
    };

    fetchReadme();
  }, [project]);

    if (!project) {
    // If state is missing (e.g., direct navigation), redirect to home
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-10 md:p-14 shadow-2xl space-y-10">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/70 hover:bg-gray-700/80 rounded text-sm"
      >
        <span>← Back</span>
      </motion.button>

      <motion.h1
        className="text-3xl md:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {project.title}
      </motion.h1>

      <motion.img
        src={project.image}
        alt={project.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl mx-auto mb-12 object-contain rounded-xl shadow-lg"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6 prose-lg"
      >
        {project.description}
      </motion.p>

      <h2 className="text-2xl font-semibold mb-6">Technologies Used</h2>
      <ul className="flex flex-wrap gap-3 mb-12">
        {project.technologies?.map((tech, idx) => (
          <li
            key={idx}
            className="px-3 py-1 bg-blue-600/70 rounded-full text-sm backdrop-blur-md"
          >
            {tech}
          </li>
        ))}
      </ul>

      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-full text-sm font-semibold mb-12 shadow-lg"
        >
          View on GitHub
        </a>
      )}

      {readmeHtml ? (
        <div
          className="prose prose-lg prose-invert max-w-none text-gray-300 mx-auto leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
        />
      ) : readmeError ? (
        <p className="text-red-400">{readmeError}</p>
      ) : (
        <p className="text-gray-400">Loading detailed README...</p>
      )}
      </div>
    </div>
  );
}
