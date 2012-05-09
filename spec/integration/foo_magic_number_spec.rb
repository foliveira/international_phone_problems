require 'spec_helper'
require 'foo'

describe "Foo's Magic Number" do
  it 'has a magic number' do
    random_number = rand(100)

    result = Foo::MAGIC_NUMBER + random_number - random_number

    result.should == Foo::MAGIC_NUMBER
  end
end
