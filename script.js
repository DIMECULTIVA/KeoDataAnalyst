// --- SCROLL ANIMATIONS (Motion Effects) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.hidden').forEach((el) => {
    observer.observe(el);
});

// --- PROJECT DATABASE ---
const projectData = {
    project1: {
        sql: `-- SQL Query: Q3 Revenue Optimization
SELECT 
    Region,
    SUM(Revenue) as Total_Revenue,
    AVG(Discount_Applied) as Avg_Discount
FROM Sales_Data
WHERE Quarter = 'Q3'
GROUP BY Region
ORDER BY Total_Revenue DESC;`,
        
        python: `# Python: Data Cleaning Script
import pandas as pd

df = pd.read_csv('raw_crm_data.csv')
df.dropna(subset=['Revenue'], inplace=True)
df['Discount_Applied'].fillna(0, inplace=True)
print(f"Cleaned {len(df)} rows ready for analysis.")`,
        
        powerbi: `To embed an actual Power BI dashboard here without leaving the site:
1. Go to Power BI Service -> File -> Embed Report -> Publish to Web.
2. Copy the <iframe> code.
3. Paste the iframe HTML inside this string in script.js.`
    },
    
    // MySQL Layoffs Project
    project2: {
        sql: `-- EXECUTIVE SUMMARY: Global Layoffs Data Architecture
-- Objective: Clean raw HR data, remove anomalies, and extract longitudinal trends.

-- Highlight 1: Safely Isolating & Removing Duplicates
WITH duplicate_cte AS (
    SELECT *,
    ROW_NUMBER() OVER(
        PARTITION BY company, location, industry, total_laid_off, 
        percentage_laid_off, \`date\`, stage, country, funds_raised_millions
    ) AS row_num
    FROM layoffs_staging
)
DELETE FROM duplicate_cte WHERE row_num > 1;

-- Highlight 2: Calculating Rolling Totals using Window Functions
WITH Rolling_Total AS (
    SELECT SUBSTRING(\`date\`,1,7) AS \`MONTH\`, SUM(total_laid_off) AS total_off
    FROM layoffs_staging2
    WHERE SUBSTRING(\`date\`,1,7) IS NOT NULL
    GROUP BY \`MONTH\`
    ORDER BY 1 ASC
)
SELECT \`MONTH\`, total_off,
    SUM(total_off) OVER(ORDER BY \`MONTH\`) AS rolling_total
FROM Rolling_Total;

-- Highlight 3: Complex CTEs to find Top 5 Layoffs per Year
WITH Company_Year (company, years, total_laid_off) AS (
    SELECT company, YEAR(\`date\`), SUM(total_laid_off)
    FROM layoffs_staging2
    GROUP BY company, YEAR(\`date\`)
), Company_Year_Rank AS (
    SELECT *, DENSE_RANK() OVER (PARTITION BY years ORDER BY total_laid_off DESC) AS Ranking
    FROM Company_Year
    WHERE years IS NOT NULL
)
SELECT * FROM Company_Year_Rank WHERE Ranking <= 5;

/* Note: The full 200+ line pipeline includes complete staging 
   environments, null value imputation, and standardization logic. */`,
        
        // Exact GitHub link for recruiters
        githubLink: "https://github.com/DIMECULTIVA/KeoDataAnalyst/blob/main/Company%20Layoffs%20Cleaning%20and%20Exploratory%20Project.sql"
    }
};

// --- MODAL LOGIC ---
const modal = document.getElementById('dataModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');

function openModal(tech, projectId) {
    // Set Title
    modalTitle.innerText = `${tech.toUpperCase()} - Code & Context`;
    
    // Fetch appropriate data
    const dataContent = projectData[projectId][tech];
    
    // Handle iframes vs pure code
    if(dataContent.includes('<iframe')) {
        modalBody.innerHTML = dataContent;
        modalBody.style.fontFamily = 'inherit';
        modalBody.style.background = '#fff'; 
    } else {
        modalBody.innerText = dataContent;
        modalBody.style.fontFamily = 'monospace';
        modalBody.style.background = '#0a0a0a';
    }

    // Build the footer buttons dynamically
    let footerHTML = `<a href="mailto:keotlhapane011@gmail.com" class="neon-btn primary small">Discuss this data</a>`;
    
    // If a GitHub link exists for this project, add the button
    if (projectData[projectId].githubLink) {
        footerHTML = `<a href="${projectData[projectId].githubLink}" target="_blank" class="neon-btn outline small" style="margin-right: 15px;"><i class="fab fa-github"></i> View Full Architecture</a>` + footerHTML;
    }
    
    modalFooter.innerHTML = footerHTML;

    // Show Modal
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

// Close modal if user clicks outside the glass box
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}