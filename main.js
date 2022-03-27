'use strict';

const JOBS = $('.jobs');
const FILTERED_CATEGORIES = $('.filtered-categories');
const CLEAR_BTN = $('.filtered-categories__clear-btn');
const FILTERED_CATEGORIES_CONTAINER = $('.filtered-categories__container');

// Animation Durations (make sure these match respective CSS custom properties)
const adShort = 200;
const adLong = 500;

let isAnimating = false;

/* ------------------------------------------------------ */
/*                Display Jobs on page load               */
/* ------------------------------------------------------ */
const createJobElements = job => {
    const JOB = $('<article>').addClass('job');
    if (job.new) JOB.addClass('new');
    if (job.featured) JOB.addClass('featured');

    // Get all roles, levels, languages and tools to create 'category' buttons
    const categoriesArray = [job.role, job.level, ...job.languages, ...job.tools];
    let categoriesHTMLString = '';
    for (const category of categoriesArray) {
        const categoryHTMLString = `<button class="job__category" type="button">${category}</button>`;
        categoriesHTMLString += categoryHTMLString;
    }

    JOB.html(`
        <img class="job__logo" src=${job.logo} alt="" aria-hidden="true">

        <section class="job__description">
            <h2 class="job__title"><a class="job__link" href="#">${job.position}</a></h2>
            <p class="job__company" aria-label="Company name">${job.company}</p>
            <p class="job__new-tag">New!</p>
            <p class="job__featured-tag">Featured</p>
            <p class="job__details">
                ${job.postedAt}<span class="job__bullet" aria-hidden="true">&bull;</span>${job.contract}<span class="job__bullet" aria-hidden="true">&bull;</span>${job.location}
            </p>
        </section>
        
        <section class="job__categories">
            <h3 class="sr-only">Job Categories</h3>
            ${categoriesHTMLString}
        </section>
    `)

    JOBS.append(JOB);
}

const getJobs = async () => {
    try {
        const response = await fetch('./data.json');
        const jobs = await response.json();

        jobs.forEach(job => createJobElements(job));
    }
    catch (error) {
        console.log(error);
    }
}

getJobs();

/* ------------------------------------------------------ */
/*                 Filter Jobs by Category                */
/* ------------------------------------------------------ */
const filterJobs = () => {
    const filteredCategoryArray = [...FILTERED_CATEGORIES_CONTAINER[0].children].map(category => category.innerText.replace(/[^a-z]/gi, ''));
    
    const JOB_CATEGORIES_CONTAINERS = $(JOBS).find('.job__categories');

    for (const jobCategoryContainer of JOB_CATEGORIES_CONTAINERS) {
        const jobCategoryArray = [...$(jobCategoryContainer).find('.job__category')].map(category => category.innerText);
        const containsAllCategories = filteredCategoryArray.every(category => jobCategoryArray.indexOf(category) !== -1);
        
        const JOB = $(jobCategoryContainer).parent();
        
        if (!containsAllCategories) {
            JOB.addClass('hide');
            setTimeout(() => $(JOB).slideUp(adLong), adLong);
            
        }
        else {
            $(JOB).slideDown(adLong);
            setTimeout(() => JOB.removeClass('hide'), adLong);
        }
    }
}

/* ------------------------------------------------------ */
/*     Add Categories to 'Filtered Categories' Section    */
/* ------------------------------------------------------ */
const categoriesFlipDown = () => FILTERED_CATEGORIES.addClass('show');

const categoryFadeIn = () => {
    $(FILTERED_CATEGORIES_CONTAINER).find('.filtered-categories__category').removeClass('hidden'); 
}
    
const addFilteredCategory = categoryName => {
    // Ensure the category cannot be added more than once
    const FILTERED_CATEGORY_TEXT_ELEMENTS = FILTERED_CATEGORIES.find('.filtered-categories__text')
    for (const filteredCategoryTextElement of FILTERED_CATEGORY_TEXT_ELEMENTS) {
        if ($(filteredCategoryTextElement).html() === categoryName) return;
    }

    if (isAnimating) return;

    isAnimating = true;

    const FILTERED_CATEGORY = $(`
        <p class="filtered-categories__category hidden">
            <span class="filtered-categories__text" aria-live="polite">${categoryName}</span>
            <button
                class="filtered-categories__x-btn"
                type="button"
                aria-label="Remove ${categoryName} job filter"><!-- Pseudo Element --></button>
        </p>
    `);

    FILTERED_CATEGORIES_CONTAINER.append(FILTERED_CATEGORY);

    if (!FILTERED_CATEGORIES.hasClass('show')) {
        categoriesFlipDown();
        setTimeout(categoryFadeIn, adShort);
    }
    else setTimeout(categoryFadeIn, 10);

    filterJobs();

    setTimeout(() => isAnimating = false, adLong);
}

$(document).click(e => {
    if (e.target && e.target.className === 'job__category') {
        const categoryName = e.target.innerText;
        addFilteredCategory(categoryName);
    }
});

/* -------------------------------------------------------------- */
/*    Remove Single Category from 'Filtered Categories' Section   */
/* -------------------------------------------------------------- */
const categoriesFlipUp = () => FILTERED_CATEGORIES.removeClass('show');

const removeSingleCategory = category => {
    if (isAnimating) return;

    isAnimating = true;

    category.addClass('hidden');
    
    setTimeout(() => $(category).animate({marginRight: '-1rem', width: 'toggle'}, adLong), adShort);
    setTimeout(() => {
        if (FILTERED_CATEGORIES_CONTAINER[0].children.length === 1) categoriesFlipUp();
        category.remove();
        filterJobs();
    }, adShort + adLong);
    setTimeout(() => isAnimating = false, adLong);   
}

FILTERED_CATEGORIES_CONTAINER.click(e => {
    if (e.target && e.target.className === 'filtered-categories__x-btn') {
        const category = $(e.target).parent();
        removeSingleCategory(category);
    }
});

/* ------------------------------------------------------------ */
/*   Remove All Categories from 'Filtered Categories' Section   */
/* ------------------------------------------------------------ */
const removeAllCategories = () => {
    if (isAnimating) return;

    isAnimating = true;

    const FILTERED_CATEGORIES = FILTERED_CATEGORIES_CONTAINER.children();
    for (const category of FILTERED_CATEGORIES) {
        $(category).addClass('hidden');   
    }

    setTimeout(() => {
        categoriesFlipUp();
        FILTERED_CATEGORIES_CONTAINER.html('')
        filterJobs();
    }, adShort + adLong);

    setTimeout(() => isAnimating = false, adLong);
}

CLEAR_BTN.click(() => removeAllCategories());