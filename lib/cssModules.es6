import fs from 'fs';
import path from 'path';
import _get from 'lodash.get';
import parseAttrs from 'posthtml-attrs-parser';


export default (cssModulesPath) => {
    return function cssModules(tree) {
        tree.match({attrs: {'css-module': /\w+/}}, node => {
            const attrs = parseAttrs(node.attrs);
            const cssModuleName = attrs['css-module'];
            delete attrs['css-module'];

            attrs.class = attrs.class || [];
            attrs.class.push(getCssClassName(cssModulesPath, cssModuleName));
            node.attrs = attrs.compose();

            return node;
        });
    };
};


function getCssClassName(cssModulesPath, cssModuleName) {
    if (fs.lstatSync(cssModulesPath).isDirectory()) {
        let cssModulesDir = cssModulesPath;
        let cssModuleNameParts = cssModuleName.split('.');
        let cssModulesFile = cssModuleNameParts.shift();
        cssModuleName = cssModuleNameParts.join('.');
        cssModulesPath = path.join(cssModulesDir, cssModulesFile);
    }
    const filePath = path.resolve(cssModulesPath) + (/\.json$/.test(cssModulesPath) ? '' : '.json');
    var fileIsExists = fsExistsSync(filePath);
    const cssModules = fileIsExists ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : require(path.resolve(cssModulesPath));
    const cssClassName = _get(cssModules, cssModuleName);
    if (! cssClassName) {
        throw getError('CSS module "' + cssModuleName + '" is not found');
    } else if (typeof cssClassName !== 'string') {
        throw getError('CSS module "' + cssModuleName + '" is not a string');
    }

    return cssClassName;
}

function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

function getError(message) {
    const fullMessage = '[posthtml-css-modules] ' + message;
    return new Error(fullMessage);
}
