import TreeNode from './tree/node';
import Select from './select/select';

export default {
    expand(iView) {
        TreeNode.expand(iView.Tree.components.TreeNode);
        Select.expand(iView.Select)
    }
}