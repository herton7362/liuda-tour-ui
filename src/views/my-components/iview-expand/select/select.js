export default {
    expand(Select) {
        const old = Select.watch.value;
        Select.watch.value = function(val) {
            old.call(this, val);
            if (val === null) this.query = '';
        }
    }
}