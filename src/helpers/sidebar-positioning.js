export function calculateVerticalPosition(
  direction, // returns "up" if the last scroll event was up or "down" if it was down
  primaryElementId, // the elementId of the positioned sidebar element
  topLimitElementClass // the element you're aligning against (usually .FormSection)
) {

  const areElementsPresent =
    document.getElementById('main') &&
    document.getElementById(primaryElementId) &&
    document.querySelector(topLimitElementClass);
  if (!areElementsPresent) { return; }

  const headerHeight = 128;

  const formHeight = document.getElementById(primaryElementId).getBoundingClientRect().height;
  const windowRelativeAnchor = document.querySelector(topLimitElementClass).getBoundingClientRect().top
               + window.scrollY;
  const offsetAnchor = document.querySelector(topLimitElementClass).offsetTop;

  const isAboveFixed = window.scrollY
                     < windowRelativeAnchor - 24 - headerHeight;

  const isBelowFixed = window.scrollY
                     + formHeight
                     - 48
                     + headerHeight
                     > windowRelativeAnchor
                     + document.querySelector(topLimitElementClass).getBoundingClientRect().height;

  if (isAboveFixed) {
    const value = offsetAnchor;
    document.getElementById(primaryElementId).style.top = `${value}px`;
    return;
  }

  if (isBelowFixed) {
    const value = offsetAnchor
             + document.querySelector(topLimitElementClass).getBoundingClientRect().height
             - formHeight;
             //- 20; // if you're below the 'window.fixed' point, move to the bottom
    document.getElementById(primaryElementId).style.top = `${value}px`;
    return;
  }

  if (direction === 'up') {
    if (document.getElementById(primaryElementId).getBoundingClientRect().top - 24 - headerHeight > 0) {
      const value = offsetAnchor + 24 - document.querySelector(topLimitElementClass).getBoundingClientRect().top + headerHeight;
      document.getElementById(primaryElementId).style.top = `${value}px`;
    }

  } else if (direction === 'down') {
    if ( document.getElementById(primaryElementId).getBoundingClientRect().bottom + 24 - headerHeight < window.innerHeight ) {

      const value1 = window.scrollY - offsetAnchor + 24 + headerHeight; // bigger than vp - this isn't right
      const value2 = window.scrollY - windowRelativeAnchor + offsetAnchor + 24 + headerHeight;

      document.getElementById(primaryElementId).style.top = `${formHeight + 48 > window.innerHeight ? value1 : value2}px`;

    }
  }
}
