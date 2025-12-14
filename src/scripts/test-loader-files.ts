import { loadRepoFiles } from "../repo/load-repo-files";

async function main() {

    const repoFiles = [
        "src/components/alerts/contexts/alerts-context.js",
        "src/components/alerts/contexts/alerts-provider.jsx",
        "src/components/alerts/contexts/alerts-reducer.js",
        "src/components/alerts/alert.jsx",
        "src/components/alerts/alerts.jsx",
    ]

    const files = await loadRepoFiles(repoFiles);

    console.log("Loaded:", files.map(f => f.path));
    console.log("Content preview:");
    console.log(files.map(f => f.content));
}

main();