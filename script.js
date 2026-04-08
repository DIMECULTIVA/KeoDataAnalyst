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

const projectData = {
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
        
        githubLink: "https://github.com/DIMECULTIVA/KeoDataAnalyst/blob/main/Company%20Layoffs%20Cleaning%20and%20Exploratory%20Project.sql"
    }
};

const modal = document.getElementById('dataModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');

function openModal(tech, projectId) {
    modalTitle.innerText = `${tech.toUpperCase()} - Code & Context`;
    const dataContent = projectData[projectId][tech];
    
    if(dataContent.includes('<iframe')) {
        modalBody.innerHTML = dataContent;
        modalBody.style.fontFamily = 'inherit';
        modalBody.style.background = '#fff';
    } else {
        modalBody.innerText = dataContent;
        modalBody.style.fontFamily = 'monospace';
        modalBody.style.background = '#0a0a0a';
    }

    let footerHTML = `<a href="mailto:keotlhapane011@gmail.com" class="neon-btn primary small">Discuss this data</a>`;
    
    if (projectData[projectId].githubLink) {
        footerHTML = `<a href="${projectData[projectId].githubLink}" target="_blank" class="neon-btn outline small" style="margin-right: 15px;"><i class="fab fa-github"></i> View Full Architecture</a>` + footerHTML;
    }
    
    modalFooter.innerHTML = footerHTML;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}