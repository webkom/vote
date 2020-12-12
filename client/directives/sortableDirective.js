const Sortable = require('sortablejs').Sortable;

module.exports = function () {
  return {
    restrict: 'A',
    scope: {
      sortableList: '=',
      sortableAnimation: '=',
      sortableOnUpdate: '=',
      sortableDelay: '=',
    },
    link: function (scope, elem) {
      let img;
      Sortable.create(elem[0], {
        delay: scope.sortableDelay,
        delayOnTouchOnly: true,
        animation: scope.sortableAnimation,
        setData: function (dataTransfer, el) {
          img = el.cloneNode(true);
          img.style.visibility = 'hidden';
          img.style.top = '0';
          img.style.left = '0';
          img.style.position = 'absolute';

          document.body.appendChild(img);

          dataTransfer.setDragImage(img, 0, 0);
        },
        onEnd: function () {
          img.parentNode.removeChild(img);
        },
        onUpdate: scope.sortableOnUpdate,
      });
    },
  };
};
