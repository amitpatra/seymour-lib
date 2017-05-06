'use strict';

function renderMicroViz(env) {
  let microVizEvents;
  if (env.callerEnv) {
    microVizEvents = new MicroVizEvents(globalEnv.programOrSendEvent, globalEnv.sourceLoc);
    microVizEvents.eventGroups = [new LocalEventGroup().add(env.microVizEvents)];
  } else {
    microVizEvents = env.microVizEvents;
  }

  microVizDiv.innerHTML = '';
  //microVizDiv.appendChild(d('model', {}, renderModel(microVizEvents)));
  microVizDiv.appendChild(renderProgram());
  microVizDiv.appendChild(renderMicroViz(microVizEvents));
  fixHeights();

  function renderProgram() {
    return d('program', {}, ...lines.map((line, idx) =>
        d('line', {startLine: idx + 1, endLine: idx + 1},
            d('number', {}, '' + (idx + 1)),
            d('text', {}, line))));
  }

  function renderMicroViz(thing, sourceLoc = thing.sourceLoc, cssClass = '') {
    const attributes =
        {startLine: sourceLoc.startLineNumber, endLine: sourceLoc.endLineNumber, class: cssClass};
    if (thing instanceof Event) {
      return d('event', attributes, thing.toMicroVizString());
    } else if (thing instanceof MicroVizEvents) {
      return d('send', attributes,
          d('spacerGroup', {}, ...range(sourceLoc.startLineNumber, sourceLoc.endLineNumber).map(line =>
              d('spacer', {startLine: line, endLine: line}))),
          ...thing.eventGroups.map(eg => renderMicroViz(eg, sourceLoc)));
    } else if (thing instanceof LocalEventGroup) {
      let currLine = sourceLoc.startLineNumber;
      const children = [];
      thing.events.forEach(event => {
        const firstInLine = event.sourceLoc.startLineNumber >= currLine;
        while (currLine < event.sourceLoc.startLineNumber) {
          children.push(d('spacer', {startLine: currLine, endLine: currLine}));
          currLine++;
        }
        children.push(renderMicroViz(event, event.sourceLoc, firstInLine ? 'newline' : ''));
        currLine = event.sourceLoc.endLineNumber + 1;
      });
      return d('localEventGroup', {}, ...children);
    } else if (thing instanceof RemoteEventGroup) {
      return d('remoteEventGroup', {}, ...thing.events.map(e => renderMicroViz(e, sourceLoc, 'remote newline')));
    } else {
      throw new Error('not sure how to renderMicroViz ' + JSON.stringify(thing));
    }
    return node;
  }

  function fixHeights() {
    const elements = [].slice.call(document.querySelectorAll('#microVizDiv *[startLine][endLine]'));
    for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
      const bottom = elements.
          filter(element => element.getAttribute('endLine') == lineNumber).
          map(element => element.getBoundingClientRect().bottom).
          reduce((x, y) => Math.max(x, y));

      const line = document.querySelector('#microVizDiv program line[startLine="' + lineNumber + '"]');
      inflate(line, bottom);

      const spacers = [].slice.call(
          document.querySelectorAll('#microVizDiv spacer[endLine="' + lineNumber + '"]'));
      spacers.forEach(spacer => inflate(spacer, bottom));

      const localEvents = [].slice.call(
          document.querySelectorAll('#microVizDiv event[endLine="' + lineNumber + '"]:not(.remote)'));
      localEvents.forEach(event => inflate(event, bottom));
    }
  }

  function inflate(element, bottomY) {
    element.style.marginBottom = bottomY - element.getBoundingClientRect().bottom;
  }
}
