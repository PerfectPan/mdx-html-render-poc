import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import html from 'rehype-stringify';
import remarkRehype from 'remark-rehype';

export function compile(presetMDX) {
  return new Promise((resolve, reject) => {
    try {
      remark()
        .use(remarkMdx)
        .use(remarkRehype, {
          unknownHandler: (state, node) => {
            if (node.type === 'mdxJsxFlowElement') {
              const result = {
                type: 'element',
                tagName: 'aily-button',
                properties: node.attributes.reduce((prev, attr) => {
                  prev[attr.name] = attr.value;
                  return prev;
                }, {}),
                children: state.wrap(state.all(node), true),
              };
              state.patch(node, result);
              return state.applyData(node, result);
            }
          },
        })
        .use(html)
        .process(presetMDX, function (err, file) {
          if (err) {
            reject(err.reason);
          }
          return resolve(String(file));
        });
    } catch (e) {
      reject(e.reason);
    }
  });
}
