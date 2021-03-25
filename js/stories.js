"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${currentUser ? toggleFavorite(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function toggleFavorite(story, user) {
  const star = user.isFavorite(story) ? "fas" : "far";
  return `
      <span class="star">
        <i class="${star} fa-star"></i>
      </span>`;
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

async function submitNewStory(evt) {
  evt.preventDefault();
  const storyData = {
    title: $("#create-title").val(), 
    url: $("#create-url").val(), 
    author: $("#create-author").val(), 
    username: currentUser.username
  };
  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
}

$submitForm.on("submit", submitNewStory);

async function toggleStoryFavorite(evt) {
  const storyId = $(evt.target).closest("li").attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($(evt.target).hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  }
}

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();
  if (currentUser.favorites.length !== 0) {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  } else {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  }
  $favoritedStories.show();
}

$storiesLists.on("click", ".star", toggleStoryFavorite);