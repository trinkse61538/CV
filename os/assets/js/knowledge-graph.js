(() => {
  const root = document.querySelector('[data-knowledge-graph]');
  if (!root) return;

  const source = root.dataset.source;
  const svg = root.querySelector('[data-graph-svg]');
  const detail = root.querySelector('[data-graph-detail]');
  const search = root.querySelector('[data-graph-search]');
  const reset = root.querySelector('[data-graph-reset]');
  const filters = Array.from(root.querySelectorAll('[data-graph-filter]'));
  const status = root.querySelector('[data-graph-status]');
  const countNodes = root.querySelector('[data-node-count]');
  const countEdges = root.querySelector('[data-edge-count]');

  const NS = 'http://www.w3.org/2000/svg';
  let graph = null;
  let activeType = 'all';
  let selectedId = null;
  let query = '';

  const createSvg = (name, attrs = {}) => {
    const element = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };

  const normalize = (value) => String(value || '').toLowerCase().trim();

  const matchesQuery = (node) => {
    if (!query) return true;
    const haystack = [node.title, node.shortLabel, node.summary, node.type, ...(node.tags || [])]
      .map(normalize)
      .join(' ');
    return haystack.includes(query);
  };

  const isVisible = (node) => {
    const typeMatch = activeType === 'all' || node.type === activeType;
    return typeMatch && matchesQuery(node);
  };

  const connectionIds = (id) => {
    if (!id) return new Set();
    const ids = new Set([id]);
    graph.edges.forEach((edge) => {
      if (edge.source === id) ids.add(edge.target);
      if (edge.target === id) ids.add(edge.source);
    });
    return ids;
  };

  const updateDetail = (node) => {
    if (!node) {
      detail.innerHTML = `
        <span class="graph-detail-kicker">Select a node</span>
        <h3>Inspect a record and its connections.</h3>
        <p>Choose any visible node to highlight its direct relationships and open the source record.</p>`;
      return;
    }

    const relatedEdges = graph.edges.filter((edge) => edge.source === node.id || edge.target === node.id);
    const related = relatedEdges.map((edge) => {
      const relatedId = edge.source === node.id ? edge.target : edge.source;
      const relatedNode = graph.nodes.find((candidate) => candidate.id === relatedId);
      const direction = edge.source === node.id ? edge.relation : `is ${edge.relation} by`;
      return { node: relatedNode, direction };
    }).filter((item) => item.node);

    detail.innerHTML = `
      <span class="graph-detail-kicker">${node.type}</span>
      <h3>${node.title}</h3>
      <p>${node.summary}</p>
      <div class="graph-detail-relations">
        ${related.map((item) => `<span><strong>${item.direction}</strong> ${item.node.shortLabel}</span>`).join('') || '<span>No direct connections.</span>'}
      </div>
      <a class="button primary" href="${node.url}">Open source record</a>`;
  };

  const applyState = () => {
    if (!graph) return;
    const connected = connectionIds(selectedId);
    let visibleCount = 0;

    svg.querySelectorAll('.kg-node').forEach((element) => {
      const node = graph.nodes.find((item) => item.id === element.dataset.id);
      const visible = isVisible(node);
      const connectedToSelection = !selectedId || connected.has(node.id);
      element.classList.toggle('is-hidden', !visible);
      element.classList.toggle('is-muted', visible && !connectedToSelection);
      element.classList.toggle('is-active', node.id === selectedId);
      if (visible) visibleCount += 1;
    });

    svg.querySelectorAll('.kg-edge').forEach((element) => {
      const sourceNode = graph.nodes.find((node) => node.id === element.dataset.source);
      const targetNode = graph.nodes.find((node) => node.id === element.dataset.target);
      const visible = isVisible(sourceNode) && isVisible(targetNode);
      const active = selectedId && (element.dataset.source === selectedId || element.dataset.target === selectedId);
      element.classList.toggle('is-hidden', !visible);
      element.classList.toggle('is-muted', visible && selectedId && !active);
      element.classList.toggle('is-active', Boolean(active));
    });

    svg.querySelectorAll('.kg-edge-label').forEach((element) => {
      const sourceNode = graph.nodes.find((node) => node.id === element.dataset.source);
      const targetNode = graph.nodes.find((node) => node.id === element.dataset.target);
      const visible = isVisible(sourceNode) && isVisible(targetNode);
      const active = selectedId && (element.dataset.source === selectedId || element.dataset.target === selectedId);
      element.classList.toggle('is-hidden', !visible);
      element.classList.toggle('is-muted', visible && selectedId && !active);
      element.classList.toggle('is-active', Boolean(active));
    });

    status.textContent = `${visibleCount} of ${graph.nodes.length} nodes visible${selectedId ? ' · direct connections highlighted' : ''}`;
  };

  const selectNode = (node) => {
    selectedId = selectedId === node.id ? null : node.id;
    updateDetail(selectedId ? node : null);
    applyState();
  };

  const render = () => {
    svg.innerHTML = '';

    const defs = createSvg('defs');
    const marker = createSvg('marker', {
      id: 'kg-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5,
      markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse'
    });
    marker.appendChild(createSvg('path', { d: 'M 0 0 L 10 5 L 0 10 z' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

    graph.edges.forEach((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      if (!sourceNode || !targetNode) return;

      const line = createSvg('line', {
        x1: sourceNode.x, y1: sourceNode.y,
        x2: targetNode.x, y2: targetNode.y,
        'marker-end': 'url(#kg-arrow)'
      });
      line.classList.add('kg-edge', `relation-${edge.relation}`);
      line.dataset.source = edge.source;
      line.dataset.target = edge.target;
      svg.appendChild(line);

      const label = createSvg('text', {
        x: (sourceNode.x + targetNode.x) / 2,
        y: (sourceNode.y + targetNode.y) / 2 - 8,
        'text-anchor': 'middle'
      });
      label.classList.add('kg-edge-label');
      label.dataset.source = edge.source;
      label.dataset.target = edge.target;
      label.textContent = edge.label;
      svg.appendChild(label);
    });

    graph.nodes.forEach((node) => {
      const group = createSvg('g', { tabindex: 0, role: 'link', 'aria-label': `${node.type}: ${node.title}` });
      group.classList.add('kg-node', `type-${node.type}`);
      group.dataset.id = node.id;
      group.setAttribute('transform', `translate(${node.x} ${node.y})`);

      group.appendChild(createSvg('rect', { x: -72, y: -29, width: 144, height: 58, rx: 16 }));

      const title = createSvg('text', { x: 0, y: -2, 'text-anchor': 'middle' });
      title.classList.add('kg-node-title');
      title.textContent = node.shortLabel;
      group.appendChild(title);

      const type = createSvg('text', { x: 0, y: 15, 'text-anchor': 'middle' });
      type.classList.add('kg-node-type');
      type.textContent = node.type;
      group.appendChild(type);

      group.addEventListener('click', () => selectNode(node));
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectNode(node);
        }
      });
      svg.appendChild(group);
    });

    countNodes.textContent = String(graph.nodes.length);
    countEdges.textContent = String(graph.edges.length);
    root.classList.add('is-enhanced');
    updateDetail(null);
    applyState();
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      activeType = button.dataset.graphFilter;
      filters.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
      selectedId = null;
      updateDetail(null);
      applyState();
    });
  });

  search.addEventListener('input', () => {
    query = normalize(search.value);
    selectedId = null;
    updateDetail(null);
    applyState();
  });

  reset.addEventListener('click', () => {
    activeType = 'all';
    selectedId = null;
    query = '';
    search.value = '';
    filters.forEach((button) => button.classList.toggle('is-active', button.dataset.graphFilter === 'all'));
    updateDetail(null);
    applyState();
  });

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`Graph data returned ${response.status}`);
      return response.json();
    })
    .then((data) => {
      graph = data;
      render();
    })
    .catch((error) => {
      status.textContent = 'Interactive graph unavailable. The static connection index remains available below.';
      console.error(error);
    });
})();
