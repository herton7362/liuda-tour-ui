export default {
    expand(TreeNode) {
        const old = TreeNode.computed.classes;
        TreeNode.computed.classes = function() {
            return [
                this.data.nodeClass,
                ...old.call(this)
            ]
        }
    }
}