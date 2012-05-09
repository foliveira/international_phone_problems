require 'bundler/setup'

begin
  require 'yard'

  YARD::Rake::YardocTask.new do |t|
    t.options += ['--title', "Talkdesk Project"]
  end
rescue LoadError
  puts "Yardoc not available."
end

desc 'Run all specs through RSpec'
task :spec do
  system 'bundle exec rspec spec/unit spec/integration'
end
