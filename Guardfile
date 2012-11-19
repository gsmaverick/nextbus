# Build all the libraries that the application requires.
guard 'sprockets', :destination => 'static/js', :asset_paths => ['libs'], :root_file => 'libs/libs.js' do
    watch(%r{^libs/.*\.js$})
end

# Build the main source file.
guard 'sprockets', :destination => 'static/js', :minify => 'yes', :asset_paths => ['Source'], :root_file => 'Source/application.js' do
  watch(%r{^Source/**/.*\.js$})
  watch(%r{^Source/**/.*\.ejs$})
end

# Build the marketing js file.
guard 'sprockets', :destination => 'static/js', :minify => 'yes', :asset_paths => ['Source'], :root_file => 'Source/marketing.js' do
  watch(%r{^Source/.*\.js$})
end

# Build the jasmine specs for the application.
guard 'sprockets', :destination => 'Specs', :asset_paths => ['Specs/Source'], :root_file => 'Specs/Source/Specs.js' do
  watch(%r{^Specs/Source/**/.*\.js$})
end

# Build all the css.
guard 'sprockets', :destination => 'static/css', :minify => 'yes', :asset_paths => ['Source/Sass'], :root_file => 'Source/Sass/application.css.scss' do
  watch(%r{^Source/Sass/application/**/.*\.scss$})
end

guard 'sprockets', :destination => 'static/css', :minify => 'yes', :asset_paths => ['Source/Sass'], :root_file => 'Source/Sass/standalone.css.scss' do
  watch(%r{^Source/Sass/standalone/**/.*\.scss$})
end

guard 'sprockets', :destination => 'static/css', :minify => 'yes', :asset_paths => ['Source/Sass'], :root_file => 'Source/Sass/marketing.css.scss' do
  watch(%r{^Source/Sass/marketing/**/.*\.scss$})
end