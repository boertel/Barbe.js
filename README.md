# Barbe.js

*Extra Layer for your favorite templating engine.*

More details here: [https://boertel.github.com/Barbe.js](https://boertel.github.com/Barbe.js)

The main features are:

### Get all your templates in one collection 
same as ICanHaz.js - [https://github.com/HenrikJoreteg/ICanHaz.js](https://github.com/HenrikJoreteg/ICanHaz.js)

### Define in the template where to attach it in the document

    <script id="template-name" type="text/html" data-anchor="anchor-name">...</script>

### Execute functions on the data before it populates the template 

    success: function (response) {
        ...
    }

### Insert automatically a loader during an ajax call

    <div class="barbe-loader"></div>

