require 'bundler/setup'
require 'simplecov'

ENV['RACK_ENV'] = 'test'

SimpleCov.start do
  add_filter '/spec/'
  add_filter '/config/'
end

$LOAD_PATH << File.join(File.dirname(__FILE__), '..', 'lib')
