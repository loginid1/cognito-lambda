import mimetypes

# make sure that Flask reads .js and .css files correctly
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
