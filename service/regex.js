/**
 * Created by Marius on 3-4-2017.
 */
module.exports = {

    parse: function (str) {
        return (str + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
    }

}
;