const container = document.getElementById('container');
const width = container.scrollWidth;
const height = container.scrollHeight || 1500;

let background_color = "#ffffff";
let node_fill_color = "#008bad";
let node_stroke_color = "#ffffff";
let edge_color = "#a8a8a8";

let graph;
let graph_data;

const relations = ['functionally coupled with', 'has attribute', 'interactive with', 'located in', 'material', 'part of', 'physically coupled with', 'subclass of'];

const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 20,
    getContent(e) {
        if (e.item._cfg.type == "node") {
            const out_div = document.createElement('div');
            out_div.style.width = '180px';
            out_div.innerHTML = `<h4>${e.item.getModel().id}</h4>`
            return out_div;
        } else if (e.item._cfg.type == "edge") {
            const out_div = document.createElement('div');
            out_div.style.width = '180px';
            out_div.innerHTML = `<h4>${e.item.getModel().source}, ${relations[e.item.getModel().relation - 1]}, ${e.item.getModel().target}</h4>`
            return out_div;
        }
    },
    itemTypes: ['node', 'edge']
});

function reload(d) {
    let data = JSON.parse(JSON.stringify(d));
    container.innerHTML = "";
    graph = new G6.Graph({
        plugins: [tooltip],
        container: 'container',
        width,
        height,
        modes: {
            default: ['zoom-canvas', 'drag-canvas', 'drag-node'],
        },
        layout: {
            type: 'forceAtlas2',
            preventOverlap: true,
            kr: 30,
        },
        defaultNode: {
            size: 2,
            style: {
                fill: node_fill_color,
                stroke: node_stroke_color,
                lineWidth: 0.5,
            },
        },
        defaultEdge: {
            style: {
                stroke: edge_color,
            },
        },
        nodeStateStyles: {
            hover: {
                fill: "pink",
            },
        },
        edgeStateStyles: {
            hover: {
                stroke: "yellow",
                lineWidth: 2,
            },
        },
    });
    graph.on('afterlayout', e => {
        graph.fitView()
    })
    graph.on("node:mouseenter", (e) => {
        const nodeItem = e.item;
        graph.setItemState(nodeItem, "hover", true);
    });
    graph.on("node:mouseleave", (e) => {
        const nodeItem = e.item;
        graph.setItemState(nodeItem, "hover", false);
    });
    graph.on("edge:mouseenter", (e) => {
        const edgeItem = e.item;
        graph.setItemState(edgeItem, "hover", true);
    });
    graph.on("edge:mouseleave", (e) => {
        const edgeItem = e.item;
        graph.setItemState(edgeItem, "hover", false);
    });

    graph.data(data);
    graph.render();
}
const rgbback = document.getElementById('rgb-background');
const rgbnodefill = document.getElementById('rgb-node-fill');
const rgbnodestroke = document.getElementById('rgb-node-stroke');
const rgbedge = document.getElementById('rgb-edge');

function watchColorPickerBackground(event) {
    background_color = event.target.value;
    container.style.background = background_color;
}
rgbback.addEventListener("change", watchColorPickerBackground, false);

function watchColorPickerNodeFill(event) {
    node_fill_color = event.target.value;
    reload(graph_data);
}
rgbnodefill.addEventListener("change", watchColorPickerNodeFill, false);

function watchColorPickerNodeStroke(event) {
    node_stroke_color = event.target.value;
    reload(graph_data);
}
rgbnodestroke.addEventListener("change", watchColorPickerNodeStroke, false);

function watchColorPickerEdge(event) {
    edge_color = event.target.value;
    reload(graph_data);
}
rgbedge.addEventListener("change", watchColorPickerEdge, false);

container.style.background = background_color;

document.getElementById('save-btn').addEventListener("click", () => {
    graph.downloadFullImage("graph", "image/png", {
        backgroundColor: background_color,
    });
});

fetch('./kg_data.json')
    .then((res) => res.json())
    .then((data) => {
        graph_data = data;
        graph_data.nodes.forEach(node => {
            let relation_count = 0;
            graph_data.edges.forEach((edge) => { relation_count += (edge.source === node.id || edge.target === node.id) ? 1 : 0 });
            node.size = relation_count + 2;
            node.x = Math.random() * 1;
        });
        reload(graph_data);
    });

if (typeof window !== 'undefined')
    window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        graph.changeSize(container.scrollWidth, container.scrollHeight);
    };