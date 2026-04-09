// TODO: Remove after confirming DB migration is complete
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string; // raw markdown body
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
  const posts = files.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    return {
      slug: data.slug || filename.replace(/\.md$/, ""),
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || "",
      content,
    } as BlogPost;
  });
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

/** Lightweight markdown to HTML — handles headings, paragraphs, bold, italic, links, and lists. */
export function markdownToHtml(markdown: string): string {
  return markdown
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Headings
      if (trimmed.startsWith("## ")) return `<h2>${inline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("### ")) return `<h3>${inline(trimmed.slice(4))}</h3>`;
      // Unordered list
      if (trimmed.match(/^[-*] /m)) {
        const items = trimmed
          .split("\n")
          .map((li) => `<li>${inline(li.replace(/^[-*] /, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      // Paragraph
      return `<p>${inline(trimmed.replace(/\n/g, " "))}</p>`;
    })
    .join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-brand-500 hover:underline">$1</a>');
}
